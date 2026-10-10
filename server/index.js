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
  hydrateMembershipFromDurable,
  persistMembership,
} from './auth.js'
import {
  loadCourseConfig,
  saveCourseConfig,
  courseConfigToPublic,
  findPlan,
} from './courseConfigStore.js'
import {
  loadProgressDoc,
  getDurableProgress,
  saveDurableProgress,
} from './progressStore.js'
import { evaluateServerCompletion } from './completion.js'

initDb()
console.log(
  '[cq-api] course price durable writes:',
  process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN ? 'token configured' : 'token MISSING (set CQ_GITHUB_TOKEN on Vercel Production)'
)

const app = express()
const PORT = process.env.CQ_API_PORT || 3001
const ADMIN_EMAIL = String(process.env.CQ_ADMIN_EMAIL || 'admin@computerquest.local').trim().toLowerCase()
const ADMIN_PASSWORD = String(process.env.CQ_ADMIN_PASSWORD || 'Admin@123').trim()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`
}

function certId() {
  const part = () => randomBytes(2).toString('hex').toUpperCase()
  return `CQ-${Date.now().toString(36).toUpperCase().slice(-4)}-${part()}-${part()}`
}

function grantAdminMembership(userId) {
  const start = new Date()
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 2)
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
     VALUES (?, 'active', ?, ?, 'admin_grant', ?)`
  ).run(userId, start.toISOString(), end.toISOString(), now)
}

async function ensureAdmin() {
  if (!ADMIN_PASSWORD) {
    console.warn('[cq-api] CQ_ADMIN_PASSWORD is empty after trim — admin login will fail until set')
  }
  const password_hash = await hashPassword(ADMIN_PASSWORD)
  const now = new Date().toISOString()
  const emails = Array.from(
    new Set([ADMIN_EMAIL, 'admin@computerquest.local', 'admin@computerquest.app'].map((e) => e.toLowerCase()))
  )

  for (const email of emails) {
    try {
      const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(email)
      if (existing) {
        db.prepare(
          `UPDATE users SET password_hash = ?, role = 'admin', name = ? WHERE email = ?`
        ).run(password_hash, 'Course Admin', email)
        grantAdminMembership(existing.id)
        console.log(`[cq-api] Admin credentials synced: ${email}`)
        continue
      }
      const id = uid('usr')
      db.prepare(
        `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
      ).run(id, email, 'Course Admin', password_hash, now)
      grantAdminMembership(id)
      console.log(`[cq-api] Bootstrap admin: ${email}`)
    } catch (e) {
      console.warn(`[cq-api] ensureAdmin failed for ${email}:`, e.message)
    }
  }
}

function configFromDurable(cfg) {
  if (!cfg) return null
  return {
    id: 1,
    price_paise: cfg.price_paise,
    duration_days: cfg.duration_days,
    title: cfg.title,
    completion_json: cfg.completion_json,
    plans: cfg.plans || [],
    updated_at: cfg.updated_at,
  }
}

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
    plans: [],
    updated_at: new Date().toISOString(),
  }
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

async function loadProgress(userId) {
  let local = defaultProgress()
  const row = db.prepare('SELECT data_json FROM progress WHERE user_id = ?').get(userId)
  if (row?.data_json) {
    try {
      local = { ...defaultProgress(), ...JSON.parse(row.data_json) }
    } catch {
      /* keep default */
    }
  }
  try {
    await loadProgressDoc()
    const durable = getDurableProgress(userId)
    if (durable && typeof durable === 'object') {
      return mergeProgressBlobs(local, durable)
    }
  } catch (e) {
    console.warn('[cq-api] durable progress load', e.message)
  }
  return local
}

function mergeProgressBlobs(a, b) {
  const base = defaultProgress()
  const left = a && typeof a === 'object' ? a : {}
  const right = b && typeof b === 'object' ? b : {}
  const union = (x, y) => [...new Set([...(x || []), ...(y || [])])]
  const xp = Math.max(left.xp || 0, right.xp || 0, 0)
  return {
    ...base,
    ...left,
    ...right,
    xp,
    level: Math.max(1, Math.floor(xp / 200) + 1),
    streak: Math.max(left.streak || 0, right.streak || 0),
    lastActiveDate: right.lastActiveDate || left.lastActiveDate || null,
    completedLessons: union(left.completedLessons, right.completedLessons),
    practiceCompleted: union(left.practiceCompleted, right.practiceCompleted),
    revisionCompleted: union(left.revisionCompleted, right.revisionCompleted),
    achievements: union(left.achievements, right.achievements),
    lessonScores: { ...(left.lessonScores || {}), ...(right.lessonScores || {}) },
    practiceScores: { ...(left.practiceScores || {}), ...(right.practiceScores || {}) },
    revisionScores: { ...(left.revisionScores || {}), ...(right.revisionScores || {}) },
    testScores: { ...(left.testScores || {}), ...(right.testScores || {}) },
    gamesPlayed: { ...(left.gamesPlayed || {}), ...(right.gamesPlayed || {}) },
    weakTopics: Array.isArray(right.weakTopics) ? right.weakTopics : left.weakTopics || [],
    strongTopics: Array.isArray(right.strongTopics) ? right.strongTopics : left.strongTopics || [],
    settings:
      right.settings && typeof right.settings === 'object'
        ? { ...(left.settings || {}), ...right.settings }
        : left.settings || base.settings,
  }
}

function saveProgressLocal(userId, progress) {
  const now = new Date().toISOString()
  const data_json = JSON.stringify(progress)
  db.prepare(
    `INSERT INTO progress (user_id, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
  ).run(userId, data_json, now)
}

async function saveProgress(userId, progress) {
  saveProgressLocal(userId, progress)
  try {
    await saveDurableProgress(userId, progress)
  } catch (e) {
    console.warn('[cq-api] durable progress save', e.message)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'computer-quest-api',
    ts: new Date().toISOString(),
    adminEmail: ADMIN_EMAIL,
    adminPasswordConfigured: Boolean(ADMIN_PASSWORD),
  })
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
    const mem = getMembership(id)
    const token = signToken(user, mem)
    res.json({ ok: true, token, user: publicUser(user, membershipPublic(mem)) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Signup failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    try {
      await ensureAdmin()
    } catch (e) {
      console.warn('[cq-api] ensureAdmin during login:', e.message)
    }
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '').trim()
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email and password required' })
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    const match = await comparePassword(password, user.password_hash)
    if (!match) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    await hydrateMembershipFromDurable(user)
    const mem = getMembership(user.id)
    const token = signToken(user, mem)
    res.json({
      ok: true,
      token,
      user: publicUser(user, membershipPublic(mem)),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Login failed' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    await hydrateMembershipFromDurable(req.user)
  } catch (e) {
    console.warn('[cq-api] hydrate on /me', e.message)
  }
  const mem = getMembership(req.user.id)
  const token = signToken(req.user, mem)
  res.json({
    ok: true,
    token,
    user: publicUser(req.user, membershipPublic(mem)),
  })
})

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

app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await loadProgress(req.user.id)
    res.json({ ok: true, progress })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to load progress' })
  }
})

app.put('/api/progress', authMiddleware, async (req, res) => {
  try {
    const incoming = req.body?.progress
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid progress' })
    }
    const existing = await loadProgress(req.user.id)
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
    delete cleaned.user_id
    delete cleaned.updated_at
    await saveProgress(req.user.id, cleaned)
    res.json({ ok: true, progress: cleaned })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to save progress' })
  }
})

app.post('/api/progress/migrate', authMiddleware, async (req, res) => {
  try {
    const local = req.body?.progress
    if (!local || typeof local !== 'object') {
      return res.status(400).json({ ok: false, error: 'No local progress' })
    }
    const existing = await loadProgress(req.user.id)
    const merged = mergeProgressBlobs(existing, local)
    await saveProgress(req.user.id, merged)
    res.json({ ok: true, progress: merged })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to migrate progress' })
  }
})

export default app

if (!process.env.VERCEL) {
  ensureAdmin()
    .then(() => {
      app.listen(PORT, () => console.log(`[cq-api] listening on http://127.0.0.1:${PORT}`))
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
