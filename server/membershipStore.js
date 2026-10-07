/**
 * Durable membership store (GitHub-backed, same pattern as courseConfigStore).
 *
 * Source of truth for paid access across Vercel serverless instances:
 *   server/data/memberships.json in the repo (raw URL reads; Contents API writes).
 *
 * JWT membership claims are a verified snapshot for the current session; this store
 * is consulted on login /auth/me / payment flows so a new instance can restore access.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const PATH_IN_REPO = 'server/data/memberships.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function githubToken() {
  return String(process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '').trim()
}

function resolveLocalPath() {
  if (process.env.CQ_MEMBERSHIPS_PATH) return path.resolve(process.env.CQ_MEMBERSHIPS_PATH)
  if (isServerless()) return path.join('/tmp', 'computer-quest-data', 'memberships.json')
  return path.join(__dirname, 'data', 'memberships.json')
}

function emptyDoc() {
  return { updated_at: new Date().toISOString(), byUserId: {} }
}

function normalize(doc) {
  if (!doc || typeof doc !== 'object') return emptyDoc()
  const byUserId = doc.byUserId && typeof doc.byUserId === 'object' ? doc.byUserId : {}
  return {
    updated_at: doc.updated_at || new Date().toISOString(),
    byUserId: { ...byUserId },
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
    fs.writeFileSync(p, JSON.stringify(doc, null, 2))
  } catch {
    /* read-only or ephemeral failure */
  }
}

let cache = null
let cacheLoadedAt = 0
const CACHE_MS = 30_000

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
      'User-Agent': 'computer-quest-membership-store',
    },
  })
  if (res.status === 404) return { sha: null, content: null }
  if (!res.ok) throw new Error(`GitHub memberships read failed (${res.status})`)
  const body = await res.json()
  const text = Buffer.from(body.content || '', 'base64').toString('utf8')
  return { sha: body.sha, content: normalize(JSON.parse(text || '{}')) }
}

async function writeGithub(doc, sha) {
  const token = githubToken()
  if (!token) return { ok: false, reason: 'no_token' }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}`
  const payload = {
    message: `chore(memberships): update durable membership ledger`,
    content: Buffer.from(JSON.stringify(doc, null, 2), 'utf8').toString('base64'),
    branch: BRANCH,
  }
  if (sha) payload.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'computer-quest-membership-store',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GitHub memberships persist failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return { ok: true }
}

export async function loadMemberships({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheLoadedAt < CACHE_MS) return cache
  const fromGh = await readFromGitHubRaw()
  const local = readLocalFile()
  let doc = fromGh || local || emptyDoc()
  if (fromGh && local) {
    for (const [id, row] of Object.entries(local.byUserId || {})) {
      const a = fromGh.byUserId[id]
      if (!a) {
        doc.byUserId[id] = row
        continue
      }
      const at = Date.parse(a.updated_at || 0) || 0
      const bt = Date.parse(row.updated_at || 0) || 0
      if (bt > at) doc.byUserId[id] = row
    }
  }
  cache = normalize(doc)
  cacheLoadedAt = Date.now()
  writeLocalFile(cache)
  return cache
}

export function getDurableMembership(userId) {
  if (!userId || !cache) return null
  return cache.byUserId[userId] || null
}

export function getDurableMembershipByEmail(email) {
  if (!email || !cache) return null
  const em = String(email).toLowerCase()
  for (const row of Object.values(cache.byUserId || {})) {
    if (String(row.email || '').toLowerCase() === em) return row
  }
  return null
}

export async function saveDurableMembership(row) {
  if (!row?.user_id) return { ok: false, error: 'user_id required' }
  const doc = await loadMemberships({ force: true })
  const next = {
    user_id: row.user_id,
    email: row.email || doc.byUserId[row.user_id]?.email || '',
    status: row.status || 'none',
    start_at: row.start_at || null,
    expires_at: row.expires_at || null,
    source: row.source || null,
    plan_id: row.plan_id || null,
    updated_at: row.updated_at || new Date().toISOString(),
  }
  doc.byUserId[row.user_id] = next
  doc.updated_at = next.updated_at
  writeLocalFile(doc)
  cache = doc
  cacheLoadedAt = Date.now()

  let persistedToGitHub = false
  let warning
  try {
    if (githubToken()) {
      const meta = await readGithubMeta()
      const remote = meta.content || emptyDoc()
      remote.byUserId = { ...remote.byUserId, [row.user_id]: next }
      remote.updated_at = next.updated_at
      await writeGithub(remote, meta.sha)
      cache = remote
      writeLocalFile(remote)
      persistedToGitHub = true
    } else {
      warning =
        'CQ_GITHUB_TOKEN not set — membership saved on this instance only until token is configured'
    }
  } catch (e) {
    warning = e.message || 'Failed to persist membership to GitHub'
    console.warn('[cq-memberships]', warning)
  }

  return {
    ok: true,
    membership: next,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}
