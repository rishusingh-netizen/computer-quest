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
import {
  loadUsersDoc,
  getDurableUserByEmail,
  saveDurableUser,
} from './userStore.js'
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
    const em = String(email).toLowerCase().trim()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(em)
    if (existing) return res.status(409).json({ ok: false, error: 'Email already registered' })
    try {
      await loadUsersDoc()
      if (getDurableUserByEmail(em)) {
        return res.status(409).json({ ok: false, error: 'Email already registered' })
      }
    } catch (e) {
      console.warn('[cq-api] durable user check on signup', e.message)
    }
    const id = uid('usr')
    const password_hash = await hashPassword(password)
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'student', ?)`
    ).run(id, em, name, password_hash, now)
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
       VALUES (?, 'none', null, null, null, ?)`
    ).run(id, now)
    try {
      await saveDurableUser({
        id,
        email: em,
        name,
        password_hash,
        role: 'student',
        created_at: now,
      })
    } catch (e) {
      console.warn('[cq-api] durable user save on signup', e.message)
    }
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
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      try {
        await loadUsersDoc()
        const durable = getDurableUserByEmail(email)
        if (durable?.password_hash) {
          db.prepare(
            `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
          ).run(
            durable.id,
            durable.email,
            durable.name || email.split('@')[0],
            durable.password_hash,
            durable.role || 'student',
            durable.created_at || new Date().toISOString()
          )
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
        }
      } catch (e) {
        console.warn('[cq-api] durable user hydrate on login', e.message)
      }
    }
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    let passwordHash = user.password_hash
    if (!passwordHash) {
      try {
        await loadUsersDoc()
        const durable = getDurableUserByEmail(email)
        if (durable?.password_hash) {
          passwordHash = durable.password_hash
          db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(passwordHash, user.id)
        }
      } catch {
        /* ignore */
      }
    }
    const match = await comparePassword(password, passwordHash || '')
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

app.post('/api/payments/create-order', authMiddleware, async (req, res) => {
  try {
    const cfg = await getConfig()
    const planId = String(req.body?.planId || req.body?.plan_id || '').trim()
    let plan = planId ? findPlan(cfg, planId) : null
    if (planId && (!plan || !plan.active)) {
      return res.status(400).json({ ok: false, error: 'Selected plan is not available' })
    }
    if (!plan) {
      plan = (cfg.plans || []).find((p) => p.active) || null
    }
    const amountPaise = plan
      ? Number(plan.price_paise) || 0
      : Number(cfg.price_paise) || 0
    const durationDays = plan
      ? Number(plan.duration_days) || 730
      : Number(cfg.duration_days) || 730
    const resolvedPlanId = plan?.id || null
    const id = uid('ord')
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO orders (id, user_id, amount_paise, currency, status, provider, created_at, updated_at, plan_id)
       VALUES (?, ?, ?, 'INR', 'created', 'mock', ?, ?, ?)`
    ).run(id, req.user.id, amountPaise, now, now, resolvedPlanId)
    res.json({
      ok: true,
      order: {
        id,
        amountPaise,
        amountInr: Math.round(amountPaise / 100),
        currency: 'INR',
        status: 'created',
        provider: 'mock',
        planId: resolvedPlanId,
        planName: plan?.name || cfg.title,
        durationDays,
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
  const plan = order.plan_id ? findPlan(cfg, order.plan_id) : null
  const rawDays = plan
    ? Number(plan.duration_days ?? plan.durationDays)
    : Number(cfg.duration_days)
  const durationDays =
    Number.isFinite(rawDays) && rawDays > 0
      ? Math.round(rawDays)
      : Number(cfg.duration_days) > 0
        ? Math.round(Number(cfg.duration_days))
        : 730
  const planId = plan?.id || order.plan_id || null
  const source = planId ? `purchase:${planId}` : 'purchase'
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + durationDays)
  const user =
    db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) || req.user
  const persisted = await persistMembership(user, {
    status: 'active',
    start_at: start.toISOString(),
    expires_at: end.toISOString(),
    source,
    plan_id: planId,
  })
  const mem = persisted.row || getMembership(user.id)
  const token = signToken(user, mem)
  res.json({
    ok: true,
    status: 'paid',
    token,
    user: publicUser(user, membershipPublic(mem)),
    durable: persisted.durable?.durable,
    warning: persisted.durable?.warning,
  })
})

app.get('/api/completion/status', authMiddleware, async (req, res) => {
  const progress = await loadProgress(req.user.id)
  const cfg = await getConfig()
  const evaluation = evaluateServerCompletion(progress, cfg)
  res.json({ ok: true, progress, evaluation })
})

app.post('/api/certificates/issue', authMiddleware, async (req, res) => {
  const existing = db.prepare('SELECT * FROM certificates WHERE user_id = ?').get(req.user.id)
  if (existing) {
    return res.json({
      ok: true,
      alreadyIssued: true,
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
  const progress = await loadProgress(req.user.id)
  const evaluation = evaluateServerCompletion(progress, cfgRow)
  if (!evaluation.eligible) {
    return res.status(403).json({
      ok: false,
      error: 'Complete all course requirements before requesting a certificate.',
      evaluation,
    })
  }
  const id = certId()
  const completedAt = new Date().toISOString()
  const courseName = cfgRow.title || 'Computer Quest'
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
    const body = req.body || {}
    const current = await getConfig()
    const next = { ...current }
    if (body.pricePaise != null || body.price_paise != null) {
      next.price_paise = Number(body.pricePaise ?? body.price_paise) || 0
    }
    if (body.durationDays != null || body.duration_days != null) {
      next.duration_days = Number(body.durationDays ?? body.duration_days) || 730
    }
    if (body.title != null) next.title = String(body.title)
    if (body.completion != null) {
      next.completion_json =
        typeof body.completion === 'string' ? body.completion : JSON.stringify(body.completion)
    }
    if (Array.isArray(body.plans)) {
      next.plans = body.plans
      const active = body.plans.find((p) => p && p.active !== false) || body.plans[0]
      if (active) {
        const pp =
          active.pricePaise != null
            ? Number(active.pricePaise)
            : active.price_paise != null
              ? Number(active.price_paise)
              : next.price_paise
        const dd =
          active.durationDays != null
            ? Number(active.durationDays)
            : active.duration_days != null
              ? Number(active.duration_days)
              : next.duration_days
        if (Number.isFinite(pp)) next.price_paise = pp
        if (Number.isFinite(dd) && dd > 0) next.duration_days = dd
      }
    }
    const saved = await saveCourseConfig({
      price_paise: next.price_paise,
      duration_days: next.duration_days,
      title: next.title,
      completion_json: next.completion_json,
      plans: next.plans || [],
    })
    const pub = courseConfigToPublic(saved || next)
    res.json({ ok: true, course: pub, durable: Boolean(saved) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to update course config' })
  }
})

app.post('/api/admin/membership', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, email, status, days, planId } = req.body || {}
    let user = null
    if (userId) user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user && email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim())
    }
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' })
    const start = new Date()
    const end = new Date(start)
    const d = Number(days) > 0 ? Number(days) : 730
    end.setDate(end.getDate() + d)
    const source = planId ? `admin:${planId}` : 'admin_grant'
    const persisted = await persistMembership(user, {
      status: status || 'active',
      start_at: start.toISOString(),
      expires_at: end.toISOString(),
      source,
      plan_id: planId || null,
    })
    res.json({
      ok: true,
      membership: membershipPublic(persisted.row || getMembership(user.id)),
      durable: persisted.durable?.durable,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to update membership' })
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
