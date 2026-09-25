/**
 * Auth store — prefers server API; falls back to legacy local mode only if API is offline.
 * Membership and role always come from server when online.
 */

import { api, setToken, clearToken, getToken } from './api'

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

export async function restoreSession() {
  const token = getToken()
  if (!token) {
    lastUser = null
    return null
  }
  const res = await api.me()
  if (!res.ok) {
    clearToken()
    lastUser = null
    return null
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

export async function serverCreateOrder() {
  return api.createOrder()
}

export async function serverConfirmPayment(orderId, mockResult) {
  return api.confirmPayment(orderId, mockResult)
}
