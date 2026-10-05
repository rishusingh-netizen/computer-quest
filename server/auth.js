import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const JWT_SECRET = process.env.CQ_JWT_SECRET || 'cq-dev-jwt-secret-change-in-production'
const JWT_DAYS = 14

const ADMIN_EMAIL = String(process.env.CQ_ADMIN_EMAIL || 'admin@computerquest.local').trim().toLowerCase()
const ADMIN_EMAILS = new Set(
  [ADMIN_EMAIL, 'admin@computerquest.local', 'admin@computerquest.app'].map((e) => e.toLowerCase())
)

/**
 * Sign JWT. Optional membership snapshot keeps paid access alive across
 * Vercel serverless instances (ephemeral /tmp JSON DB).
 */
export function signToken(user, membershipRow = null) {
  const payload = {
    sub: user.id,
    role: user.role || 'student',
    email: user.email,
    name: user.name || '',
  }
  const m = membershipRow || getMembership(user.id)
  if (m && m.status === 'active') {
    payload.mStatus = 'active'
    payload.mStart = m.start_at || null
    payload.mExp = m.expires_at || null
    payload.mSource = m.source || null
    payload.mPlanId = m.plan_id || null
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${JWT_DAYS}d` })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function rehydrateMembershipFromJwt(userId, payload) {
  if (payload.mStatus !== 'active') return
  const now = new Date().toISOString()
  try {
    db.prepare(
      `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at, plan_id)
       VALUES (?, 'active', ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         status = 'active',
         start_at = excluded.start_at,
         expires_at = excluded.expires_at,
         source = excluded.source,
         updated_at = excluded.updated_at,
         plan_id = excluded.plan_id`
    ).run(
      userId,
      payload.mStart || now,
      payload.mExp || null,
      payload.mSource || 'jwt_rehydrate',
      now,
      payload.mPlanId || null
    )
  } catch {
    try {
      const existing = db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(userId)
      if (!existing) {
        db.prepare(
          `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
           VALUES (?, 'active', ?, ?, ?, ?)`
        ).run(userId, payload.mStart || now, payload.mExp || null, payload.mSource || 'jwt_rehydrate', now)
      }
    } catch {}
  }
}

/**
 * Resolve the session user for a verified JWT.
 * On Vercel the JSON DB under /tmp is per-instance. Login/signup may create user id A on
 * instance 1; a later request can hit instance 2 with an empty DB. For any valid JWT we
 * rehydrate the user row (and membership snapshot) from claims.
 */
function resolveSessionUser(payload) {
  if (!payload?.sub) return null

  let user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(payload.sub)
  if (user) {
    rehydrateMembershipFromJwt(user.id, payload)
    return user
  }

  const email = String(payload.email || '').trim().toLowerCase()
  if (email) {
    user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE email = ?').get(email)
    if (user) {
      rehydrateMembershipFromJwt(user.id, payload)
      return user
    }
  }

  if (!email) return null
  const now = new Date().toISOString()
  const id = String(payload.sub)
  const role = payload.role === 'admin' && ADMIN_EMAILS.has(email) ? 'admin' : 'student'
  const name =
    (payload.name && String(payload.name).trim()) ||
    (role === 'admin' ? 'Course Admin' : email.split('@')[0] || 'Student')

  try {
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, email, name, '', role, now)
  } catch {
    // concurrent insert or existing — continue
  }

  if (role === 'admin') {
    try {
      const start = new Date()
      const end = new Date(start)
      end.setFullYear(end.getFullYear() + 2)
      db.prepare(
        `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
         VALUES (?, 'active', ?, ?, 'admin_grant', ?)`
      ).run(id, start.toISOString(), end.toISOString(), now)
    } catch {}
  } else {
    rehydrateMembershipFromJwt(id, payload)
  }

  user =
    db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id) ||
    db.prepare('SELECT id, email, name, role, created_at FROM users WHERE email = ?').get(email)
  if (user) return user

  return {
    id,
    email,
    name,
    role,
    created_at: now,
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ ok: false, error: 'Invalid session' })
  const user = resolveSessionUser(payload)
  if (!user) return res.status(401).json({ ok: false, error: 'User not found' })
  req.user = user
  next()
}

export function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required' })
  }
  next()
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function publicUser(user, membership) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
    membership: membership || { status: 'none' },
  }
}

export function getMembership(userId) {
  return db.prepare('SELECT * FROM memberships WHERE user_id = ?').get(userId) || null
}

export function membershipPublic(row) {
  if (!row) return { status: 'none' }
  const now = Date.now()
  let status = row.status
  if (row.expires_at && status === 'active' && new Date(row.expires_at).getTime() < now) {
    status = 'expired'
    db.prepare(`UPDATE memberships SET status = 'expired', updated_at = ? WHERE user_id = ?`).run(
      new Date().toISOString(),
      row.user_id
    )
  }
  const planId =
    row.plan_id ||
    (typeof row.source === 'string' && row.source.startsWith('purchase:')
      ? row.source.slice('purchase:'.length)
      : null)
  return {
    status,
    startAt: row.start_at,
    expiresAt: row.expires_at,
    source: row.source,
    planId: planId || null,
  }
}
