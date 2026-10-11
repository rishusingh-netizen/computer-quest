/**
 * Durable certificate store (GitHub-backed).
 *
 * Ephemeral /tmp DB loses certificates on cold starts, so verify/mine would 404
 * after instance recycle. This ledger holds public certificate records so issue,
 * mine, verify, and admin list survive multi-instance deploys.
 *
 * Path: server/data/certificates.json
 * Shape: { updated_at, byId: { [certId]: row }, byUserId: { [userId]: certId } }
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const PATH_IN_REPO = 'server/data/certificates.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function githubToken() {
  return String(process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '').trim()
}

function resolveLocalPath() {
  if (process.env.CQ_CERTIFICATES_PATH) return path.resolve(process.env.CQ_CERTIFICATES_PATH)
  if (isServerless()) return path.join('/tmp', 'computer-quest-data', 'certificates.json')
  return path.join(__dirname, 'data', 'certificates.json')
}

function emptyDoc() {
  return { updated_at: new Date().toISOString(), byId: {}, byUserId: {} }
}

function normalize(doc) {
  if (!doc || typeof doc !== 'object') return emptyDoc()
  const byId = doc.byId && typeof doc.byId === 'object' ? { ...doc.byId } : {}
  const byUserId = {}
  for (const [id, row] of Object.entries(byId)) {
    if (!row || typeof row !== 'object') continue
    const uid = row.user_id
    if (uid) byUserId[uid] = id
  }
  if (doc.byUserId && typeof doc.byUserId === 'object') {
    for (const [uid, certId] of Object.entries(doc.byUserId)) {
      if (certId && byId[certId]) byUserId[uid] = certId
    }
  }
  return {
    updated_at: doc.updated_at || new Date().toISOString(),
    byId,
    byUserId,
  }
}

function readLocalFile() {
  try {
    const p = resolveLocalPath()
    if (fs.existsSync(p)) return normalize(JSON.parse(fs.readFileSync(p, 'utf8')))
  } catch {
    /* ignore */
  }
  return null
}

function writeLocalFile(doc) {
  try {
    const p = resolveLocalPath()
    const dir = path.dirname(p)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const out = {
      updated_at: doc.updated_at,
      byId: doc.byId || {},
      byUserId: doc.byUserId || {},
    }
    fs.writeFileSync(p, JSON.stringify(out, null, 2))
  } catch {
    /* read-only or ephemeral failure */
  }
}

let cache = null
let cacheLoadedAt = 0
const CACHE_MS = 15_000

async function readFromGitHubRaw() {
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return normalize(await res.json())
  } catch {
    return null
  }
}

async function readGithubMeta() {
  const token = githubToken()
  if (!token) return { sha: null, content: null }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'computer-quest-certificate-store',
    },
  })
  if (res.status === 404) return { sha: null, content: null }
  if (!res.ok) throw new Error(`GitHub certificates read failed (${res.status})`)
  const body = await res.json()
  const text = Buffer.from(body.content || '', 'base64').toString('utf8')
  return { sha: body.sha, content: normalize(JSON.parse(text || '{}')) }
}

async function writeGithub(doc, sha) {
  const token = githubToken()
  if (!token) return { ok: false, reason: 'no_token' }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}`
  const payload = {
    message: `chore(certificates): update durable certificate ledger`,
    content: Buffer.from(
      JSON.stringify(
        {
          updated_at: doc.updated_at,
          byId: doc.byId || {},
          byUserId: doc.byUserId || {},
        },
        null,
        2
      ),
      'utf8'
    ).toString('base64'),
    branch: BRANCH,
  }
  if (sha) payload.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'computer-quest-certificate-store',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GitHub certificates persist failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return { ok: true }
}

export async function loadCertificatesDoc({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheLoadedAt < CACHE_MS) return cache

  let fromGh = null
  if (githubToken()) {
    try {
      const meta = await readGithubMeta()
      if (meta.content) fromGh = meta.content
    } catch (e) {
      console.warn('[cq-certs] Contents API load failed, falling back to raw', e.message)
    }
  }
  if (!fromGh) {
    fromGh = await readFromGitHubRaw()
  }

  const local = readLocalFile()
  let doc = fromGh || local || emptyDoc()
  if (fromGh && local) {
    for (const [id, row] of Object.entries(local.byId || {})) {
      const a = fromGh.byId[id]
      if (!a) {
        doc.byId[id] = row
        continue
      }
      const at = Date.parse(a.updated_at || a.completed_at || 0) || 0
      const bt = Date.parse(row.updated_at || row.completed_at || 0) || 0
      if (bt > at) doc.byId[id] = row
    }
  }
  cache = normalize(doc)
  cacheLoadedAt = Date.now()
  writeLocalFile(cache)
  return cache
}

export function getDurableCertificateById(certId) {
  if (!certId || !cache) return null
  const id = String(certId).trim()
  if (cache.byId[id]) return cache.byId[id]
  const upper = id.toUpperCase()
  for (const [k, row] of Object.entries(cache.byId || {})) {
    if (String(k).toUpperCase() === upper) return row
  }
  return null
}

export function getDurableCertificateByUserId(userId) {
  if (!userId || !cache) return null
  const certId = cache.byUserId[userId]
  if (!certId) return null
  return cache.byId[certId] || null
}

export function listDurableCertificates() {
  if (!cache) return []
  return Object.values(cache.byId || {}).sort((a, b) =>
    String(a.completed_at || '') < String(b.completed_at || '') ? 1 : -1
  )
}

export async function saveDurableCertificate(cert) {
  if (!cert?.id || !cert?.user_id) return { ok: false, error: 'id and user_id required' }

  const doc = await loadCertificatesDoc({ force: true })

  const existingId = doc.byUserId[cert.user_id]
  if (existingId && doc.byId[existingId]) {
    return {
      ok: true,
      certificate: doc.byId[existingId],
      alreadyIssued: true,
      persistedToGitHub: false,
      durable: true,
    }
  }

  const next = {
    id: cert.id,
    user_id: cert.user_id,
    student_name: cert.student_name || '',
    course_name: cert.course_name || 'Computer Quest',
    completed_at: cert.completed_at || new Date().toISOString(),
    status: cert.status || 'valid',
    snapshot_json: cert.snapshot_json || null,
    updated_at: new Date().toISOString(),
  }
  doc.byId[next.id] = next
  doc.byUserId[next.user_id] = next.id
  doc.updated_at = next.updated_at
  cache = normalize(doc)
  cacheLoadedAt = Date.now()
  writeLocalFile(cache)

  let persistedToGitHub = false
  let warning
  try {
    if (githubToken()) {
      const meta = await readGithubMeta()
      const remote = meta.content || emptyDoc()
      remote.byId = { ...remote.byId, [next.id]: next }
      remote.byUserId = { ...remote.byUserId, [next.user_id]: next.id }
      remote.updated_at = next.updated_at
      await writeGithub(remote, meta.sha)
      cache = normalize(remote)
      writeLocalFile(cache)
      persistedToGitHub = true
    } else {
      warning =
        'CQ_GITHUB_TOKEN not set — certificate saved on this instance only until token is configured'
    }
  } catch (e) {
    warning = e.message || 'Failed to persist certificate to GitHub'
    console.warn('[cq-certs]', warning)
  }

  return {
    ok: true,
    certificate: next,
    alreadyIssued: false,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}

export function publicCertificate(row) {
  if (!row) return null
  return {
    id: row.id,
    studentName: row.student_name,
    courseName: row.course_name,
    completedAt: row.completed_at,
    status: row.status || 'valid',
  }
}
