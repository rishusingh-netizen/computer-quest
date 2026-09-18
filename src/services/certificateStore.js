/** Certificate helpers (server-backed via api) */

import { api } from './api'

export async function issueCertificate({ courseName, levelId } = {}) {
  const res = await api.createCertificate({ course_name: courseName, level_id: levelId })
  if (!res.ok) return { ok: false, error: res.error || 'Failed to issue certificate' }
  return { ok: true, certificate: res.certificate }
}

export async function getMyCertificate() {
  const res = await api.myCertificate()
  if (!res.ok) return { ok: false, certificate: null }
  return { ok: true, certificate: res.certificate || null }
}

export async function verifyCertificate(code) {
  const res = await api.verifyCertificate(code)
  return res
}

export function formatCertDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(iso).slice(0, 10)
  }
}
