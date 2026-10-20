/**
 * Auth store — prefers server API; falls back to legacy local mode only if API is offline.
 * Membership and role always come from server when online.
 */

import { api, setToken, clearToken, getToken, peekTokenPayload } from './api'

let lastUser = null
let apiOnline = true

export function isApiOnline() {
  return apiOnline
}

export async function ensureAdminBootstrap() {
  // Server bootstraps admin; probe health
  const health = await api.health()
  apiOnline = !health.offline
  return apiOnline
}

export async function signUp({ name, email, password }) {
  const res = await api.signup({ name, email, password })
  if (res.offline) return { ok: false, error: 'Server offline. Start the API (npm run server).' }
  if (!res.ok) return { ok: false, error: res.error || 'Signup failed' }
  setToken(res.token)
  lastUser = res.user
  // migrate local progress if any
  try {
    const raw = localStorage.getItem('cq_progress')
    if (raw) {
      const progress = JSON.parse(raw)
      await api.migrateProgress(progress)
    }
  } catch {}
  return { ok: true, user: res.user }
}

export async function login({ email, password }) {
  const res = await api.login({
    email: String(email || '').trim().toLowerCase(),
    password: String(password || '').trim(),
  })
  if (res.offline) return { ok: false, error: 'Server offline. Start the API (npm run server).' }
  if (!res.ok) return { ok: false, error: res.error || 'Login failed' }
  setToken(res.token)
  lastUser = res.user
  try {
    const raw = localStorage.getItem('cq_progress')
    if (raw) {
      const progress = JSON.parse(raw)
      await api.migrateProgress(progress)
    }
  } catch {}
  return { ok: true, user: res.user }
}

export function logout() {
  clearToken()
  lastUser = null
}

export function getSessionUser() {
  return lastUser
}

function userFromTokenPayload(payload) {
  if (!payload?.sub) return null
  const membership =
    payload.mstatus && payload.mstatus !== 'none'
      ? {
          status: payload.mstatus,
          startAt: payload.mstart || null,
          expiresAt: payload.mexp || null,
          source: payload.msource || null,
          planId: payload.mplan || null,
        }
      : { status: 'none', startAt: null, expiresAt: null, source: null, planId: null }
  return {
    id: payload.sub,
    email: payload.email || '',
    name: payload.name || '',
    role: payload.role || 'student',
    membership,
  }
}

/**
 * Restore session from localStorage JWT.
 * - Survives browser/tab close (token in localStorage, not sessionStorage).
 * - Only clears the token on explicit unauthorized (401) or client-side expiry.
 * - Offline / 5xx must NOT wipe a still-valid token (that forced admin re-login).
 */
export async function restoreSession() {
  const token = getToken()
  if (!token) {
    lastUser = null
    return null
  }

  // Expired on client clock → clear
  const peek = peekTokenPayload()
  if (!peek) {
    clearToken()
    lastUser = null
    return null
  }

  const res = await api.me()

  // Network / server errors: keep token, soft-hydrate from JWT claims for UI
  if (res.offline || (res.status && res.status >= 500)) {
    lastUser = userFromTokenPayload(peek)
    return lastUser
  }

  // Unauthorized / invalid token → full logout
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearToken()
      lastUser = null
      return null
    }
    // Other non-OK (e.g. 404) — keep token, soft hydrate
    lastUser = userFromTokenPayload(peek)
    return lastUser
  }

  // Server may return a refreshed JWT with up-to-date membership claims
  if (res.token) {
    setToken(res.token)
  }
  lastUser = res.user
  return res.user
}

export function refreshMembershipStatus(user) {
  return user // membership already server-evaluated
}

export function hasActiveAccess(user) {
  return user?.membership?.status === 'active' || user?.role === 'admin'
}

export function isAdminUser(user) {
  return String(user?.role || '').trim().toLowerCase() === 'admin'
}

/** @deprecated client orders — use api.createOrder / confirmPayment */
export function createOrder() {
  return { ok: false, error: 'Use server payment API' }
}

export async function serverCreateOrder(planId) {
  return api.createOrder(planId ? { planId } : {})
}

/**
 * Confirm mock payment. On success the server returns a refreshed JWT that
 * embeds membership claims — store it immediately so access survives cold starts
 * without requiring the student to log in again.
 */
export async function serverConfirmPayment(orderId, payload = {}) {
  const res = await api.confirmPayment(orderId, payload)
  if (res?.ok && res.token) {
    setToken(res.token)
  }
  if (res?.ok && res.user) {
    lastUser = res.user
  }
  return res
}

/** Apply a server user + optional token (e.g. after payment confirm). */
export function applySession(user, token) {
  if (token) setToken(token)
  if (user) lastUser = user
  return lastUser
}
