import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'
import {
  loadMemberships,
  getDurableMembership,
  getDurableMembershipByEmail,
  saveDurableMembership,
} from './membershipStore.js'

const JWT_SECRET = process.env.CQ_JWT_SECRET || 'cq-dev-jwt-secret-change-in-production'
const JWT_DAYS = 14

const ADMIN_EMAIL = String(process.env.CQ_ADMIN_EMAIL || 'admin@computerquest.local').trim().toLowerCase()
const ADMIN_EMAILS = new Set(
  [ADMIN_EMAIL, 'admin@computerquest.local', 'admin@computerquest.app'].map((e) => e.toLowerCase())
)

export function signToken(user, membershipRow = null) {
  const m = membershipRow || getMembership(user.id)
  const pub = membershipPublic(m)
  const payload = {
    sub: user.id,
    role: user.role || 'student',
    email: user.email,
    name: user.name || '',
  }
  if (pub && pub.status && pub.status !== 'none') {
    payload.mstatus = pub.status
    payload.mstart = pub.startAt || null
    payload.mexp = pub.expiresAt || null
    payload.msource = pub.source || null
    payload.mplan = pub.planId || null
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

function upsertLocalMembership(userId, row) {
  if (!userId || !row) return
  const now = new Date().toISOString()
  const status = row.status || 'none'
  // JSON DB adapter maps ON CONFLICT membership inserts as:
  //   [user_id, start_at, expires_at, source, updated_at, plan_id] with status 'active'
  try {
    if (status === 'active') {
      db.prepare(
        `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at, plan_id)
         VALUES (?, 'active', ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           status = 'active', start_at = excluded.start_at, expires_at = excluded.expires_at,
           source = excluded.source, updated_at = excluded.updated_at, plan_id = excluded.plan_id`
      ).run(
        userId,
        row.start_at || null,
        row.expires_at || null,
        row.source || null,
        row.updated_at || now,
        row.plan_id || null
      )
    } else {
      db.prepare(
        `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        status,
        row.start_at || null,
        row.expires_at || null,
        row.source || null,
        row.updated_at || now
      )
    }
  } catch (e) {
    console.warn('[cq-auth] upsertLocalMembership', e.message)
  }
}

function applyMembershipClaims(userId, payload) {
  if (!userId || !payload?.mstatus) return
  if (payload.mstatus !== 'active' && payload.mstatus !== 'expired') return
  upsertLocalMembership(userId, {
    status: payload.mstatus,
    start_at: payload.mstart || null,
    expires_at: payload.mexp || null,
    source: payload.msource || null,
    plan_id: payload.mplan || null,
    updated_at: new Date().toISOString(),
  })
}

function resolveSessionUser(payload) {
  if (!payload?.sub) return null

  let user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(payload.sub)
  if (user) {
    applyMembershipClaims(user.id, payload)
    return user
  }

  const email = String(payload.email || '').trim().toLowerCase()
  if (email) {
    user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE email = ?').get(email)
    if (user) {
      applyMembershipClaims(user.id, payload)
      return user
    }
  }

  if (!email) return null

  const now = new Date().toISOString()
  const id = String(payload.sub)
  let safeRole = payload.role === 'admin' ? 'admin' : 'student'
  if (safeRole === 'admin' && !ADMIN_EMAILS.has(email)) safeRole = 'student'
  const name =
    (payload.name && String(payload.name).trim()) ||
    (safeRole === 'admin' ? 'Course Admin' : email.split('@')[0] || 'Student')

  try {
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, email, name, '', safeRole, now)
  } catch {
    /* concurrent */
  }

  if (safeRole === 'admin') {
    try {
      const start = new Date()
      const end = new Date(start)
      end.setFullYear(end.getFullYear() + 2)
      db.prepare(
        `INSERT INTO memberships (user_id, status, start_at, expires_at, source, updated_at)
         VALUES (?, 'active', ?, ?, 'admin_grant', ?)`
      ).run(id, start.toISOString(), end.toISOString(), now)
    } catch {
      /* ignore */
    }
  } else {
    applyMembershipClaims(id, payload)
  }

  user =
    db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id) ||
    db.prepare('SELECT id, email, name, role, created_at FROM users WHERE email = ?').get(email)

  if (user) return user

  return { id, email, name, role: safeRole, created_at: now }
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
  req.jwtPayload = payload
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
    try {
      db.prepare(`UPDATE memberships SET status = 'expired', updated_at = ? WHERE user_id = ?`).run(
        new Date().toISOString(),
        row.user_id
      )
    } catch {
      /* ignore */
    }
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

export async function hydrateMembershipFromDurable(user) {
  if (!user?.id) return getMembership(user?.id)
  try {
    await loadMemberships()
  } catch (e) {
    console.warn('[cq-auth] loadMemberships', e.message)
  }
  let durable = getDurableMembership(user.id)
  if (!durable && user.email) durable = getDurableMembershipByEmail(user.email)
  if (durable) {
    upsertLocalMembership(user.id, durable)
  }
  return getMembership(user.id)
}

export async function persistMembership(user, membershipFields) {
  const now = new Date().toISOString()
  const row = {
    user_id: user.id,
    email: user.email,
    status: membershipFields.status || 'active',
    start_at: membershipFields.start_at || membershipFields.startAt || null,
    expires_at: membershipFields.expires_at || membershipFields.expiresAt || null,
    source: membershipFields.source || null,
    plan_id: membershipFields.plan_id || membershipFields.planId || null,
    updated_at: now,
  }
  upsertLocalMembership(user.id, row)
  const saved = await saveDurableMembership(row)
  return {
    row: getMembership(user.id),
    public: membershipPublic(getMembership(user.id)),
    durable: saved,
  }
}

export { loadMemberships, saveDurableMembership }
