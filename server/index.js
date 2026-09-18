import express from 'express'
import cors from 'cors'
import { randomBytes } from 'crypto'
import { db, initDb } from './db.js'
import {
  authMiddleware,
  adminMiddleware,
  hashPassword,
  comparePassword,
  signToken,
  publicUser,
  getMembership,
  membershipPublic,
} from './auth.js'

initDb()

const app = express()
const PORT = process.env.CQ_API_PORT || 3001
const ADMIN_EMAIL = process.env.CQ_ADMIN_EMAIL || 'admin@computerquest.local'
const ADMIN_PASSWORD = process.env.CQ_ADMIN_PASSWORD || 'Admin@123'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`
}

function certId() {
  const part = () => randomBytes(2).toString('hex').toUpperCase()
  return `CQ-${Date.now().toString(36).toUpperCase().slice(-4)}-${part()}-${part()}`
}

async function ensureAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL)
  if (existing) return
  const id = uid('usr')
  const password_hash = await hashPassword(ADMIN_PASSWORD)
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
  ).run(id, ADMIN_EMAIL, 'Course Admin', password_hash, now)
  const start = new Date()
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 2)
  db.prepare(
    `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
     VALUES (?, 'active', ?, ?, 'admin_grant', ?)`
  ).run(id, start.toISOString(), end.toISOString(), now)
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name required' })
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const id = uid('usr')
    const password_hash = await hashPassword(password)
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'student', ?)`
    ).run(id, email.toLowerCase(), name, password_hash, now)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    const token = signToken(user)
    res.json({ token, user: publicUser(user) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Signup failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await comparePassword(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ token, user: publicUser(user) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user), membership: membershipPublic(getMembership(user.id)) })
})

// Progress
app.get('/api/progress', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.user.id)
  res.json({ progress: rows })
})

app.post('/api/progress', authMiddleware, (req, res) => {
  const { level_id, lesson_id, status, score, data } = req.body || {}
  if (!level_id || !lesson_id) return res.status(400).json({ error: 'level_id and lesson_id required' })
  const now = new Date().toISOString()
  const existing = db.prepare(
    'SELECT id FROM progress WHERE user_id = ? AND level_id = ? AND lesson_id = ?'
  ).get(req.user.id, level_id, lesson_id)
  if (existing) {
    db.prepare(
      `UPDATE progress SET status = ?, score = ?, data = ?, updated_at = ? WHERE id = ?`
    ).run(status || 'completed', score ?? null, data ? JSON.stringify(data) : null, now, existing.id)
  } else {
    const id = uid('prg')
    db.prepare(
      `INSERT INTO progress (id, user_id, level_id, lesson_id, status, score, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, req.user.id, level_id, lesson_id, status || 'completed', score ?? null, data ? JSON.stringify(data) : null, now, now)
  }
  res.json({ ok: true })
})

// Certificates
app.get('/api/certificates', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC').all(req.user.id)
  res.json({ certificates: rows })
})

app.post('/api/certificates', authMiddleware, (req, res) => {
  const { course_name, level_id } = req.body || {}
  const id = certId()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO certificates (id, user_id, course_name, level_id, issued_at, verify_code)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.id, course_name || 'Computer Quest', level_id || null, now, id)
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id)
  res.json({ certificate: cert })
})

app.get('/api/certificates/verify/:code', (req, res) => {
  const cert = db.prepare('SELECT c.*, u.name as student_name FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.verify_code = ? OR c.id = ?').get(req.params.code, req.params.code)
  if (!cert) return res.status(404).json({ error: 'Certificate not found' })
  res.json({ valid: true, certificate: cert })
})

// Membership / checkout mock
app.post('/api/checkout', authMiddleware, (req, res) => {
  const { plan } = req.body || {}
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + (plan === 'yearly' ? 12 : 1))
  const existing = getMembership(req.user.id)
  if (existing) {
    db.prepare(
      `UPDATE memberships SET status = 'active', expires_at = ?, source = 'purchase', updated_at = ? WHERE user_id = ?`
    ).run(end.toISOString(), now.toISOString(), req.user.id)
  } else {
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
       VALUES (?, 'active', ?, ?, 'purchase', ?)`
    ).run(req.user.id, now.toISOString(), end.toISOString(), now.toISOString())
  }
  const paymentId = uid('pay')
  db.prepare(
    `INSERT INTO payments (id, user_id, amount, plan, status, created_at) VALUES (?, ?, ?, ?, 'completed', ?)`
  ).run(paymentId, req.user.id, plan === 'yearly' ? 4999 : 499, plan || 'monthly', now.toISOString())
  res.json({ ok: true, membership: membershipPublic(getMembership(req.user.id)) })
})

// Admin routes
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC').all()
  res.json({ users })
})

app.get('/api/admin/payments', authMiddleware, adminMiddleware, (req, res) => {
  const payments = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all()
  res.json({ payments })
})

app.get('/api/admin/certificates', authMiddleware, adminMiddleware, (req, res) => {
  const certs = db.prepare(
    `SELECT c.*, u.name as student_name, u.email FROM certificates c JOIN users u ON u.id = c.user_id ORDER BY c.issued_at DESC`
  ).all()
  res.json({ certificates: certs })
})

app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c
  const active = db.prepare("SELECT COUNT(*) as c FROM memberships WHERE status = 'active' AND expires_at > datetime('now')").get().c
  const certs = db.prepare('SELECT COUNT(*) as c FROM certificates').get().c
  const payments = db.prepare('SELECT COUNT(*) as c FROM payments').get().c
  res.json({ users, activeMembers: active, certificates: certs, payments })
})

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'computer-quest-api' }))

// SPA fallback for production if served from same origin (optional)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' })
  res.status(404).json({ error: 'Not found - API only' })
})

ensureAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Computer Quest API listening on http://localhost:${PORT}`)
  })
}).catch((e) => {
  console.error('Failed to start', e)
  process.exit(1)
})
