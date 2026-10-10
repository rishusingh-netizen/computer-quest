/**
 * Durable user credentials store (GitHub-backed).
 *
 * Ephemeral /tmp JSON loses users on cold starts, so password login would 401
 * even though JWT session restore still works. This ledger holds the minimal
 * auth fields so login can rehydrate the local DB across Vercel instances.
 *
 * Path: server/data/users.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const PATH_IN_REPO = 'server/data/users.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function githubToken() {
  return String(process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '').trim()
}

function resolveLocalPath() {
  if (process.env.CQ_USERS_PATH) return path.resolve(process.env.CQ_USERS_PATH)
  if (isServerless()) return path.join('/tmp', 'computer-quest-data', 'users.json')
  return path.join(__dirname, 'data', 'users.json')
}

function emptyDoc() {
  return { updated_at: new Date().toISOString(), byUserId: {}, byEmail: {} }
}

function normalize(doc) {
  if (!doc || typeof doc !== 'object') return emptyDoc()
  const byUserId = doc.byUserId && typeof doc.byUserId === 'object' ? { ...doc.byUserId } : {}
  const byEmail = {}
  for (const row of Object.values(byUserId)) {
    const em = String(row?.email || '').trim().toLowerCase()
    if (em) byEmail[em] = row
  }
  return {
    updated_at: doc.updated_at || new Date().toISOString(),
    byUserId,
    byEmail,
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
    const out = { updated_at: doc.updated_at, byUserId: doc.byUserId || {} }
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
      'User-Agent': 'computer-quest-user-store',
    },
  })
  if (res.status === 404) return { sha: null, content: null }
  if (!res.ok) throw new Error(`GitHub users read failed (${res.status})`)
  const body = await res.json()
  const text = Buffer.from(body.content || '', 'base64').toString('utf8')
  return { sha: body.sha, content: normalize(JSON.parse(text || '{}')) }
}

async function writeGithub(doc, sha) {
  const token = githubToken()
  if (!token) return { ok: false, reason: 'no_token' }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}`
  const payload = {
    message: `chore(users): update durable user credentials ledger`,
    content: Buffer.from(
      JSON.stringify({ updated_at: doc.updated_at, byUserId: doc.byUserId || {} }, null, 2),
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
      'User-Agent': 'computer-quest-user-store',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GitHub users persist failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return { ok: true }
}

export async function loadUsersDoc({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheLoadedAt < CACHE_MS) return cache

  let fromGh = null
  if (githubToken()) {
    try {
      const meta = await readGithubMeta()
      if (meta.content) fromGh = meta.content
    } catch (e) {
      console.warn('[cq-users] Contents API load failed, falling back to raw', e.message)
    }
  }
  if (!fromGh) {
    fromGh = await readFromGitHubRaw()
  }

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

export function getDurableUserByEmail(email) {
  if (!email || !cache) return null
  const em = String(email).trim().toLowerCase()
  return cache.byEmail[em] || null
}

export function getDurableUserById(userId) {
  if (!userId || !cache) return null
  return cache.byUserId[userId] || null
}

export async function saveDurableUser(user) {
  if (!user?.id || !user?.email) return { ok: false, error: 'id and email required' }

  const doc = await loadUsersDoc({ force: true })
  const next = {
    id: user.id,
    email: String(user.email).trim().toLowerCase(),
    name: user.name || '',
    password_hash: user.password_hash || '',
    role: user.role || 'student',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  doc.byUserId[next.id] = next
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
      remote.byUserId = { ...remote.byUserId, [next.id]: next }
      remote.updated_at = next.updated_at
      await writeGithub(remote, meta.sha)
      cache = normalize(remote)
      writeLocalFile(cache)
      persistedToGitHub = true
    } else {
      warning =
        'CQ_GITHUB_TOKEN not set — user credentials saved on this instance only until token is configured'
    }
  } catch (e) {
    warning = e.message || 'Failed to persist user to GitHub'
    console.warn('[cq-users]', warning)
  }

  return {
    ok: true,
    user: next,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}
