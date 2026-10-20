/**
 * API client for Computer Quest backend.
 *
 * Auth token: JWT only (never password). Stored in localStorage so the session
 * survives tab close and browser restart. Server JWT expiry is 14 days
 * (see server/auth.js JWT_DAYS). Logout always clears the token.
 */

export const PRODUCTION_API_ORIGIN = 'https://computer-quest.vercel.app'

function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL
  if (env !== undefined && env !== null && String(env).trim().length > 0) {
    return String(env).trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) return 'http://127.0.0.1:3001'
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return PRODUCTION_API_ORIGIN
}

const API_BASE = resolveApiBase()
const TOKEN_KEY = 'cq_api_token'

export function getToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY)
    if (token) return token
    const legacy = sessionStorage.getItem(TOKEN_KEY)
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy)
      try {
        sessionStorage.removeItem(TOKEN_KEY)
      } catch {}
      return legacy
    }
    return null
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      try {
        sessionStorage.removeItem(TOKEN_KEY)
      } catch {}
    } else {
      localStorage.removeItem(TOKEN_KEY)
      try {
        sessionStorage.removeItem(TOKEN_KEY)
      } catch {}
    }
  } catch {}
}

export function clearToken() {
  setToken(null)
}

/**
 * Decode JWT payload without verifying signature (UI hydration only).
 * Returns null if missing, malformed, or past exp.
 */
export function peekTokenPayload() {
  const token = getToken()
  if (!token) return null
  try {
    const parts = String(token).split('.')
    if (parts.length < 2) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const json = atob(b64 + pad)
    const payload = JSON.parse(json)
    if (payload?.exp && Number(payload.exp) * 1000 < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    return { ok: false, error: 'Cannot reach API server', offline: true }
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, error: data.error || res.statusText, status: res.status, ...data }
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  signup: (body) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  course: () => request('/api/course'),
  getProgress: () => request('/api/progress'),
  putProgress: (progress) =>
    request('/api/progress', { method: 'PUT', body: JSON.stringify({ progress }) }),
  migrateProgress: (progress) =>
    request('/api/progress/migrate', { method: 'POST', body: JSON.stringify({ progress }) }),
  createOrder: (body = {}) =>
    request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  submitPayment: (body = {}) =>
    request('/api/payments/submit', {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  myPayments: () => request('/api/payments/mine'),
  cancelPayment: (orderId) =>
    request('/api/payments/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  upiConfig: () => request('/api/payments/upi-config'),
  /** Legacy — auto/mock confirm disabled on server */
  confirmPayment: (orderId, payload = {}) =>
    request('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId, ...(payload && typeof payload === 'object' ? payload : {}) }),
    }),
  adminPayments: (status) =>
    request('/api/payments/admin/list' + (status ? `?status=${encodeURIComponent(status)}` : '')),
  adminVerifyPayment: (orderId) =>
    request('/api/payments/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  adminRejectPayment: (orderId, reason) =>
    request('/api/payments/admin/reject', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    }),
  completionStatus: () => request('/api/completion/status'),
  issueCertificate: () => request('/api/certificates/issue', { method: 'POST', body: '{}' }),
  myCertificate: () => request('/api/certificates/mine'),
  verifyCertificate: (id) => request(`/api/certificates/verify/${encodeURIComponent(id)}`),
  adminStudents: () => request('/api/admin/students'),
  adminOrders: () => request('/api/admin/orders'),
  adminCertificates: () => request('/api/admin/certificates'),
  adminStats: () => request('/api/admin/stats'),
  adminSetMembership: (userId, action) =>
    request('/api/admin/membership', {
      method: 'POST',
      body: JSON.stringify({ userId, action }),
    }),
  adminPatchCourse: (body) =>
    request('/api/admin/course', { method: 'PATCH', body: JSON.stringify(body) }),
}

export function isApiConfigured() {
  return true
}

export function getApiBase() {
  return API_BASE
}
