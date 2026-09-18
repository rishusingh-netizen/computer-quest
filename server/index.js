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
  console.log(`[cq-api] Bootstrap admin: ${ADMIN_EMAIL}`)
}

function getConfig() {
  return db.prepare('SELECT * FROM course_config WHERE id = 1').get()
}

function defaultProgress() {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    completedLessons: [],
    lessonScores: {},
    practiceCompleted: [],
    practiceScores: {},
    gamesPlayed: {},
    testScores: {},
    revisionScores: {},
    revisionCompleted: [],
    achievements: [],
    weakTopics: [],
    strongTopics: [],
    settings: { language: 'en' },
  }
}

function loadProgress(userId) {
  const row = db.prepare('SELECT data_json FROM progress WHERE user_id = ?').get(userId)
  if (!row?.data_json) return defaultProgress()
  try {
    return { ...defaultProgress(), ...JSON.parse(row.data_json) }
  } catch {
    return defaultProgress()
  }
}

function saveProgress(userId, progress) {
  const now = new Date().toISOString()
  const data_json = JSON.stringify(progress)
  db.prepare(
    `INSERT INTO progress (user_id, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
  ).run(userId, data_json, now)
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'computer-quest-api', ts: new Date().toISOString() })
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {}
    if (!email || !password || !name) {
      return res.status(400).json({ ok: false, error: 'email, password, and name required' })
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase())
    if (existing) return res.status(409).json({ ok: false, error: 'Email already registered' })
    const id = uid('usr')
    const password_hash = await hashPassword(password)
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'student', ?)`
    ).run(id, String(email).toLowerCase(), name, password_hash, now)
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
       VALUES (?, 'none', null, null, null, ?)`
    ).run(id, now)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    const token = signToken(user)
    res.json({ ok: true, token, user: publicUser(user, membershipPublic(getMembership(id))) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Signup failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email and password required' })
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase())
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    const ok = await comparePassword(password, user.password_hash)
    if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ ok: true, token, user: publicUser(user, membershipPublic(getMembership(user.id))) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Login failed' })
  }
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' })
  res.json({ ok: true, user: publicUser(user, membershipPublic(getMembership(user.id))) })
})

app.get('/api/course', (_req, res) => {
  const cfg = getConfig()
  res.json({
    ok: true,
    course: {
      title: cfg?.title || 'Computer Quest',
      price_paise: cfg?.price_paise ?? 299900,
      duration_days: cfg?.duration_days ?? 730,
      completion: (() => {
        try {
          return JSON.parse(cfg?.completion_json || '{}')
        } catch {
          return {}
        }
      })(),
    },
  })
})

app.get('/api/progress', authMiddleware, (req, res) => {
  res.json({ ok: true, progress: loadProgress(req.user.id) })
})

app.put('/api/progress', authMiddleware, (req, res) => {
  const progress = req.body?.progress
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ ok: false, error: 'progress object required' })
  }
  saveProgress(req.user.id, { ...defaultProgress(), ...progress })
  res.json({ ok: true, progress: loadProgress(req.user.id) })
})

app.post('/api/progress/migrate', authMiddleware, (req, res) => {
  const incoming = req.body?.progress
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ ok: false, error: 'progress object required' })
  }
  const current = loadProgress(req.user.id)
  const merged = { ...current, ...incoming }
  if ((incoming.xp || 0) < (current.xp || 0)) merged.xp = current.xp
  saveProgress(req.user.id, merged)
  res.json({ ok: true, progress: loadProgress(req.user.id) })
})

app.post('/api/payments/create-order', authMiddleware, (req, res) => {
  const cfg = getConfig()
  const id = uid('ord')
  const now = new Date().toISOString()
  const amount = cfg?.price_paise ?? 299900
  db.prepare(
    `INSERT INTO orders (id, user_id, amount_paise, currency, status, provider, provider_ref, created_at, updated_at)
     VALUES (?, ?, ?, 'INR', 'created', 'mock', null, ?, ?)`
  ).run(id, req.user.id, amount, now, now)
  res.json({ ok: true, order: { id, amount_paise: amount, currency: 'INR', status: 'created' } })
})

app.post('/api/payments/confirm', authMiddleware, (req, res) => {
  const { orderId, mockResult } = req.body || {}
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id)
  if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })
  const now = new Date().toISOString()
  if (mockResult === 'fail') {
    db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`).run(now, orderId)
    return res.json({ ok: false, error: 'Payment failed' })
  }
  db.prepare(`UPDATE orders SET status = 'paid', provider_ref = ?, updated_at = ? WHERE id = ?`).run(
    uid('ref'),
    now,
    orderId
  )
  const cfg = getConfig()
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + (cfg?.duration_days || 730))
  db.prepare(
    `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
     VALUES (?, 'active', ?, ?, 'purchase', ?)
     ON CONFLICT(user_id) DO UPDATE SET
       status = 'active', start_at = excluded.start_at, expires_at = excluded.expires_at,
       source = 'purchase', updated_at = excluded.updated_at`
  ).run(req.user.id, start.toISOString(), end.toISOString(), now)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ ok: true, user: publicUser(user, membershipPublic(getMembership(req.user.id))) })
})

app.get('/api/completion/status', authMiddleware, (req, res) => {
  const progress = loadProgress(req.user.id)
  res.json({ ok: true, progress })
})

app.post('/api/certificates/issue', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(req.user.id)
  if (existing) return res.json({ ok: true, certificate: existing })
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  const cfg = getConfig()
  const id = certId()
  const now = new Date().toISOString()
  const snapshot = JSON.stringify({ progress: loadProgress(req.user.id) })
  db.prepare(
    `INSERT INTO certificates (id, user_id, student_name, course_name, completed_at, status, snapshot_json)
     VALUES (?, ?, ?, ?, ?, 'valid', ?)`
  ).run(id, req.user.id, user.name, cfg?.title || 'Computer Quest', now, snapshot)
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id)
  res.json({ ok: true, certificate: cert })
})

app.get('/api/certificates/verify/:id', (req, res) => {
  const cert = db.prepare('SELECT * FROM certificates WHERE upper(id) = upper(?)').get(req.params.id)
  if (!cert) return res.status(404).json({ ok: false, error: 'Certificate not found' })
  res.json({
    ok: true,
    valid: cert.status === 'valid',
    certificate: {
      id: cert.id,
      student_name: cert.student_name,
      course_name: cert.course_name,
      completed_at: cert.completed_at,
      status: cert.status,
    },
  })
})

app.get('/api/certificates/mine', authMiddleware, (req, res) => {
  const cert = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(req.user.id)
  res.json({ ok: true, certificate: cert || null })
})

app.get('/api/admin/students', authMiddleware, adminMiddleware, (_req, res) => {
  const users = db.prepare(
    `SELECT u.id, u.name, u.email, u.role, u.created_at FROM users u LEFT JOIN memberships m ON m.user_id = u.id ORDER BY u.created_at DESC`
  ).all()
  res.json({ ok: true, users })
})

app.get('/api/admin/orders', authMiddleware, adminMiddleware, (_req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  res.json({ ok: true, orders })
})

app.get('/api/admin/certificates', authMiddleware, adminMiddleware, (_req, res) => {
  const certificates = db.prepare('SELECT * FROM certificates ORDER BY completed_at DESC').all()
  res.json({ ok: true, certificates })
})

app.get('/api/admin/stats', authMiddleware, adminMiddleware, (_req, res) => {
  const students = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get()?.c || 0
  const active = db.prepare("SELECT COUNT(*) as c FROM memberships WHERE status = 'active'").get()?.c || 0
  const paid = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'paid'").get()?.c || 0
  const certs = db.prepare('SELECT COUNT(*) as c FROM certificates').get()?.c || 0
  res.json({ ok: true, stats: { students, activeMembers: active, paidOrders: paid, certificates: certs } })
})

app.patch('/api/admin/course', authMiddleware, adminMiddleware, (req, res) => {
  const body = req.body || {}
  const cfg = getConfig()
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE course_config SET price_paise = ?, duration_days = ?, title = ?, completion_json = ?, updated_at = ? WHERE id = 1`
  ).run(
    body.price_paise ?? cfg.price_paise,
    body.duration_days ?? cfg.duration_days,
    body.title ?? cfg.title,
    body.completion_json ?? cfg.completion_json,
    now
  )
  res.json({ ok: true, course: getConfig() })
})

app.post('/api/admin/membership', authMiddleware, adminMiddleware, (req, res) => {
  const { userId, action } = req.body || {}
  if (!userId || !['grant', 'revoke'].includes(action)) {
    return res.status(400).json({ ok: false, error: 'userId and action (grant|revoke) required' })
  }
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!target) return res.status(404).json({ ok: false, error: 'User not found' })
  if (target.role === 'admin') {
    return res.status(400).json({ ok: false, error: 'Cannot change admin membership this way' })
  }
  const now = new Date().toISOString()
  if (action === 'grant') {
    const cfg = getConfig()
    const start = new Date()
    const end = new Date(start)
    end.setDate(end.getDate() + (cfg.duration_days || 730))
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
       VALUES (?, 'active', ?, ?, 'admin_grant', ?)
       ON CONFLICT(user_id) DO UPDATE SET
         status = 'active', start_at = excluded.start_at, expires_at = excluded.expires_at,
         source = 'admin_grant', updated_at = excluded.updated_at`
    ).run(userId, start.toISOString(), end.toISOString(), now)
  } else {
    db.prepare(`UPDATE memberships SET status = 'expired', updated_at = ? WHERE user_id = ?`).run(now, userId)
  }
  res.json({
    ok: true,
    user: publicUser(target, membershipPublic(getMembership(userId))),
  })
})

await ensureAdmin()

/** Export for Vercel serverless (api/index.js). Only listen when run as a process. */
export default app

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.js') ||
    process.argv[1].endsWith('server\\index.js') ||
    process.argv[1].includes('server/index'))

if (!isVercel && isMain) {
  app.listen(PORT, () => {
    console.log(`[cq-api] listening on http://127.0.0.1:${PORT}`)
  })
}
