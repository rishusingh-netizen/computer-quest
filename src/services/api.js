/**
 * API client — same-origin /api on Vercel; optional VITE_API_URL override for local split dev.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

let authToken = null
try {
  authToken = localStorage.getItem('cq_token') || null
} catch {}

export function setToken(token) {
  authToken = token
  try {
    if (token) localStorage.setItem('cq_token', token)
    else localStorage.removeItem('cq_token')
  } catch {}
}

export function clearToken() {
  setToken(null)
}

export function getToken() {
  return authToken
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error || res.statusText || 'Request failed', status: res.status, ...data }
    }
    return data
  } catch (e) {
    return { ok: false, offline: true, error: e.message || 'Network error' }
  }
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
