import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const JWT_SECRET = process.env.CQ_JWT_SECRET || 'cq-dev-jwt-secret-change-in-production'
const JWT_DAYS = 14

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: `${JWT_DAYS}d` }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ ok: false, error: 'Invalid session' })
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(payload.sub)
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
  return {
    status,
    startAt: row.start_at,
    expiresAt: row.expires_at,
    source: row.source,
  }
}
