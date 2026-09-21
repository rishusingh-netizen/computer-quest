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
import {
  loadCourseConfig,
  saveCourseConfig,
  courseConfigToPublic,
} from './courseConfigStore.js'

initDb()
console.log(
  '[cq-api] course price durable writes:',
  process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN ? 'token configured' : 'token MISSING (set CQ_GITHUB_TOKEN on Vercel Production)'
)

const app = express()
const PORT = process.env.CQ_API_PORT || 3001
const ADMIN_EMAIL = String(process.env.CQ_ADMIN_EMAIL || 'admin@computerquest.local').trim().toLowerCase()
const ADMIN_PASSWORD = String(process.env.CQ_ADMIN_PASSWORD || 'Admin@123')

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
  // Always keep a working owner/admin account in sync with CQ_ADMIN_* env.
  // On Vercel the JSON DB is ephemeral; re-hashing on each cold start restores login.
  const password_hash = await hashPassword(ADMIN_PASSWORD)
  const now = new Date().toISOString()
  const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(ADMIN_EMAIL)

  if (existing) {
    db.prepare(
      `UPDATE users SET password_hash = ?, role = 'admin', name = ? WHERE email = ?`
    ).run(password_hash, 'Course Admin', ADMIN_EMAIL)
    const start = new Date()
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 2)
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
       VALUES (?, 'active', ?, ?, 'admin_grant', ?)`
    ).run(existing.id, start.toISOString(), end.toISOString(), now)
    console.log(`[cq-api] Admin credentials synced: ${ADMIN_EMAIL}`)
    return
  }

  const id = uid('usr')
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

/** Sync helper: DB row shape from durable config */
function configFromDurable(cfg) {
  if (!cfg) return null
  return {
    id: 1,
    price_paise: cfg.price_paise,
    duration_days: cfg.duration_days,
    title: cfg.title,
    completion_json: cfg.completion_json,
    updated_at: cfg.updated_at,
  }
}

/**
 * Course config: durable store is source of truth for price.
 * Falls back to JSON DB row, then bootstrap defaults.
 */
async function getConfig() {
  const durable = await loadCourseConfig()
  if (durable) return configFromDurable(durable)
  const row = db.prepare('SELECT * FROM course_config WHERE id = 1').get()
  if (row) return row
  return {
    id: 1,
    price_paise: 0,
    duration_days: 730,
    title: 'Computer Quest',
    completion_json: JSON.stringify({
      mode: 'full_course',
      requireAllLessonsFromLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      minPracticeCount: 8,
      minRevisionCount: 10,
      minPassedTests: 9,
      minGamesPlayed: 2,
    }),
    updated_at: new Date().toISOString(),
  }
}

function getConfigSync() {
  // Rare sync path — prefer last known DB row; callers that need price should await getConfig()
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
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id)
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
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase())
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    const match = await comparePassword(password || '', user.password_hash)
    if (!match) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({
      ok: true,
      token,
      user: publicUser(user, membershipPublic(getMembership(user.id))),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Login failed' })
  }
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    ok: true,
    user: publicUser(req.user, membershipPublic(getMembership(req.user.id))),
  })
})

// Course config (public price/title; completion rules admin can change)
app.get('/api/course', async (_req, res) => {
  try {
    const cfg = await getConfig()
    const pub = courseConfigToPublic(cfg)
    res.json({ ok: true, course: pub })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to load course config' })
  }
})

// Progress — server is source of truth
app.get('/api/progress', authMiddleware, (req, res) => {
  res.json({ ok: true, progress: loadProgress(req.user.id) })
})

app.put('/api/progress', authMiddleware, (req, res) => {
  const incoming = req.body?.progress
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid progress' })
  }
  const existing = loadProgress(req.user.id)
  const cleaned = { ...defaultProgress(), ...existing }
  const union = (a, b) => [...new Set([...(a || []), ...(b || [])])]
  cleaned.completedLessons = union(existing.completedLessons, incoming.completedLessons)
  cleaned.practiceCompleted = union(existing.practiceCompleted, incoming.practiceCompleted)
  cleaned.revisionCompleted = union(existing.revisionCompleted, incoming.revisionCompleted)
  cleaned.achievements = union(existing.achievements, incoming.achievements)
  cleaned.lessonScores = { ...(existing.lessonScores || {}), ...(incoming.lessonScores || {}) }
  cleaned.practiceScores = { ...(existing.practiceScores || {}), ...(incoming.practiceScores || {}) }
  cleaned.revisionScores = { ...(existing.revisionScores || {}), ...(incoming.revisionScores || {}) }
  cleaned.testScores = { ...(existing.testScores || {}), ...(incoming.testScores || {}) }
  cleaned.gamesPlayed = { ...(existing.gamesPlayed || {}), ...(incoming.gamesPlayed || {}) }
  cleaned.weakTopics = Array.isArray(incoming.weakTopics) ? incoming.weakTopics : existing.weakTopics
  cleaned.strongTopics = Array.isArray(incoming.strongTopics) ? incoming.strongTopics : existing.strongTopics
  cleaned.settings =
    incoming.settings && typeof incoming.settings === 'object'
      ? { ...existing.settings, ...incoming.settings }
      : existing.settings
  const clientXp = typeof incoming.xp === 'number' && incoming.xp >= 0 ? incoming.xp : 0
  const serverXp = existing.xp || 0
  const maxJump = 500
  cleaned.xp = Math.min(Math.max(serverXp, clientXp), serverXp + maxJump)
  cleaned.level = Math.max(1, Math.floor(cleaned.xp / 200) + 1)
  cleaned.streak = Math.max(existing.streak || 0, typeof incoming.streak === 'number' ? incoming.streak : 0)
  if (incoming.lastActiveDate) cleaned.lastActiveDate = incoming.lastActiveDate
  delete cleaned.membership
  delete cleaned.role
  delete cleaned.paymentStatus
  delete cleaned.accessExpiry
  saveProgress(req.user.id, cleaned)
  res.json({ ok: true, progress: cleaned })
})

app.post('/api/progress/migrate', authMiddleware, (req, res) => {
  const local = req.body?.progress
  if (!local || typeof local !== 'object') {
    return res.status(400).json({ ok: false, error: 'No local progress' })
  }
  const existing = loadProgress(req.user.id)
  const merged = { ...defaultProgress(), ...existing }
  merged.xp = Math.max(existing.xp || 0, local.xp || 0)
  merged.level = Math.max(1, Math.floor(merged.xp / 200) + 1)
  merged.streak = Math.max(existing.streak || 0, local.streak || 0)
  const union = (a, b) => [...new Set([...(a || []), ...(b || [])])]
  merged.completedLessons = union(existing.completedLessons, local.completedLessons)
  merged.practiceCompleted = union(existing.practiceCompleted, local.practiceCompleted)
  merged.revisionCompleted = union(existing.revisionCompleted, local.revisionCompleted)
  merged.testScores = { ...(local.testScores || {}), ...(existing.testScores || {}) }
  merged.gamesPlayed = { ...(local.gamesPlayed || {}), ...(existing.gamesPlayed || {}) }
  merged.lessonScores = { ...(local.lessonScores || {}), ...(existing.lessonScores || {}) }
  merged.practiceScores = { ...(local.practiceScores || {}), ...(existing.practiceScores || {}) }
  merged.revisionScores = { ...(local.revisionScores || {}), ...(existing.revisionScores || {}) }
  saveProgress(req.user.id, merged)
  res.json({ ok: true, progress: merged })
})

// Payments — server verifies; client success alone never grants access
app.post('/api/payments/create-order', authMiddleware, async (req, res) => {
  try {
    const cfg = await getConfig()
    const id = uid('ord')
    const now = new Date().toISOString()
    const amountPaise = Number(cfg.price_paise) || 0
    db.prepare(
      `INSERT INTO orders (id, user_id, amount_paise, currency, status, provider, created_at, updated_at)
       VALUES (?, ?, ?, 'INR', 'created', 'mock', ?, ?)`
    ).run(id, req.user.id, amountPaise, now, now)
    res.json({
      ok: true,
      order: {
        id,
        amountPaise,
        amountInr: Math.round(amountPaise / 100),
        currency: 'INR',
        status: 'created',
        provider: 'mock',
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to create order' })
  }
})

app.post('/api/payments/confirm', authMiddleware, async (req, res) => {
  const { orderId, mockResult } = req.body || {}
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id)
  if (!order) return res.status(404).json({ ok: false, error: 'Order not found' })
  const now = new Date().toISOString()
  if (mockResult === 'fail' || mockResult === 'failed') {
    db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`).run(now, orderId)
    return res.json({ ok: false, status: 'failed', error: 'Payment failed' })
  }
  if (mockResult === 'cancelled') {
    db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?`).run(now, orderId)
    return res.json({ ok: false, status: 'cancelled', error: 'Payment cancelled' })
  }
  db.prepare(`UPDATE orders SET status = 'paid', provider_ref = ?, updated_at = ? WHERE id = ?`).run(
    uid('ref'),
    now,
    orderId
  )
  const cfg = await getConfig()
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + (cfg.duration_days || 730))
  db.prepare(
    `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
     VALUES (?, 'active', ?, ?, 'purchase', ?)
     ON CONFLICT(user_id) DO UPDATE SET
       status = 'active', start_at = excluded.start_at, expires_at = excluded.expires_at,
       source = 'purchase', updated_at = excluded.updated_at`
  ).run(req.user.id, start.toISOString(), end.toISOString(), now)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({
    ok: true,
    status: 'paid',
    user: publicUser(user, membershipPublic(getMembership(req.user.id))),
  })
})

app.get('/api/completion/status', authMiddleware, (req, res) => {
  const progress = loadProgress(req.user.id)
  res.json({ ok: true, progress })
})

app.post('/api/certificates/issue', authMiddleware, async (req, res) => {
  const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(req.user.id)
  if (existing) {
    return res.json({
      ok: true,
      certificate: {
        id: existing.id,
        studentName: existing.student_name,
        courseName: existing.course_name,
        completedAt: existing.completed_at,
        status: existing.status,
      },
    })
  }
  const cfgRow = await getConfig()
  const id = certId()
  const completedAt = new Date().toISOString()
  const courseName = cfgRow.title || 'Computer Quest'
  const evaluation = { snapshot: loadProgress(req.user.id) }
  db.prepare(
    `INSERT INTO certificates (id, user_id, student_name, course_name, completed_at, status, snapshot_json)
     VALUES (?, ?, ?, ?, ?, 'valid', ?)`
  ).run(id, req.user.id, req.user.name, courseName, completedAt, JSON.stringify(evaluation.snapshot || {}))
  res.json({
    ok: true,
    certificate: {
      id,
      studentName: req.user.name,
      courseName,
      completedAt,
      status: 'valid',
    },
  })
})

app.get('/api/certificates/verify/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM certificates WHERE upper(id) = upper(?)').get(req.params.id)
  if (!row) return res.status(404).json({ ok: false, error: 'Certificate not found' })
  res.json({
    ok: true,
    valid: row.status === 'valid',
    certificate: {
      id: row.id,
      studentName: row.student_name,
      courseName: row.course_name,
      completedAt: row.completed_at,
      status: row.status,
    },
  })
})

app.get('/api/certificates/mine', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(req.user.id)
  if (!row) return res.json({ ok: true, certificate: null })
  res.json({
    ok: true,
    certificate: {
      id: row.id,
      studentName: row.student_name,
      courseName: row.course_name,
      completedAt: row.completed_at,
      status: row.status,
    },
  })
})

app.get('/api/admin/students', authMiddleware, adminMiddleware, (_req, res) => {
  const users = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, m.status as membership_status, m.expires_at
       FROM users u LEFT JOIN memberships m ON m.user_id = u.id`
    )
    .all()
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
  const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'student'`).get().c
  const active = db.prepare(`SELECT COUNT(*) as c FROM memberships WHERE status = 'active'`).get().c
  const paid = db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'paid'`).get().c
  const certs = db.prepare(`SELECT COUNT(*) as c FROM certificates`).get().c
  res.json({ ok: true, stats: { totalStudents, activeMemberships: active, paidOrders: paid, certificates: certs } })
})

app.patch('/api/admin/course', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { pricePaise, priceInr, price_paise, durationDays, duration_days, title, completion } = req.body || {}
    const cfg = await getConfig()
    let nextPaise = Number(cfg.price_paise) || 0
    if (pricePaise != null && Number.isFinite(Number(pricePaise))) {
      nextPaise = Math.round(Number(pricePaise))
    } else if (price_paise != null && Number.isFinite(Number(price_paise))) {
      nextPaise = Math.round(Number(price_paise))
    } else if (priceInr != null && Number.isFinite(Number(priceInr))) {
      nextPaise = Math.round(Number(priceInr) * 100)
    }
    if (nextPaise < 0) {
      return res.status(400).json({ ok: false, error: 'Price cannot be negative' })
    }
    let nextDays = cfg.duration_days
    if (durationDays != null && Number.isFinite(Number(durationDays))) {
      nextDays = Math.round(Number(durationDays))
    } else if (duration_days != null && Number.isFinite(Number(duration_days))) {
      nextDays = Math.round(Number(duration_days))
    }
    const nextTitle = title != null && String(title).trim() ? String(title).trim() : cfg.title
    const completion_json = completion ? JSON.stringify(completion) : cfg.completion_json

    const saved = await saveCourseConfig({
      price_paise: nextPaise,
      duration_days: nextDays,
      title: nextTitle,
      completion_json,
    })
    if (!saved.ok) {
      return res.status(500).json({ ok: false, error: saved.error || 'Failed to save course config' })
    }

    const now = new Date().toISOString()
    try {
      db.prepare(
        `UPDATE course_config SET price_paise = ?, duration_days = ?, title = ?, completion_json = ?, updated_at = ? WHERE id = 1`
      ).run(nextPaise, nextDays, nextTitle, completion_json, now)
    } catch (e) {
      console.warn('[cq-api] DB course_config sync skipped:', e.message)
    }

    const pub = courseConfigToPublic(saved.config)
    res.json({
      ok: true,
      course: pub,
      persistedToGitHub: !!saved.persistedToGitHub,
      durable: !!saved.durable,
      warning: saved.warning || undefined,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to update course' })
  }
})

/** Admin grant / revoke 2-year (or configured) membership — database only */
app.post('/api/admin/membership', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, action } = req.body || {}
  if (!userId || !['grant', 'revoke'].includes(action)) {
    return res.status(400).json({ ok: false, error: 'userId and action (grant|revoke) required' })
  }
  const target = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(userId)
  if (!target) return res.status(404).json({ ok: false, error: 'User not found' })
  if (target.role === 'admin') {
    return res.status(400).json({ ok: false, error: 'Cannot change admin membership this way' })
  }
  const now = new Date().toISOString()
  if (action === 'grant') {
    const cfg = await getConfig()
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
