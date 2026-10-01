/**
 * API client for Computer Quest backend.
 *
 * Auth token: JWT only (never password). Stored in localStorage so the session
 * survives tab close and browser restart. Server JWT expiry is 14 days
 * (see server/auth.js JWT_DAYS). Logout always clears the token.
 *
 * Production API (live): https://computer-quest.vercel.app
 * Paths are always /api/...
 */

/** Live production API origin — real public HTTPS, not a placeholder */
export const PRODUCTION_API_ORIGIN = 'https://computer-quest.vercel.app'

function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL
  if (env !== undefined && env !== null && String(env).trim().length > 0) {
    return String(env).trim().replace(/\/$/, '')
  }
  // Local Vite dev → local Express
  if (import.meta.env.DEV) return 'http://127.0.0.1:3001'
  // Production: same-origin /api (works on computer-quest.vercel.app and custom domains)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return PRODUCTION_API_ORIGIN
}

const API_BASE = resolveApiBase()
const TOKEN_KEY = 'cq_api_token'

/**
 * Read JWT from durable storage (localStorage).
 * One-time migrate: if an older tab still has the token only in sessionStorage,
 * copy it to localStorage so closing the browser does not drop the session.
 */
export function getToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY)
    if (token) return token
    // Migrate from sessionStorage (previous implementation)
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
      // Clear any leftover sessionStorage copy
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
  confirmPayment: (orderId, mockResult) =>
    request('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderId, mockResult }),
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
