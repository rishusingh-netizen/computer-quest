/**
 * Durable progress store (GitHub-backed, same pattern as membershipStore).
 *
 * Source of truth for student progress across Vercel serverless instances:
 *   server/data/progress.json in the repo (raw URL reads; Contents API writes).
 *
 * The ephemeral /tmp JSON DB is still used as a fast per-instance cache; this
 * store is consulted on load and written on every progress save so cold starts
 * and multi-instance deploys restore completed lessons / XP / scores.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const PATH_IN_REPO = 'server/data/progress.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function githubToken() {
  return String(process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '').trim()
}

function resolveLocalPath() {
  if (process.env.CQ_PROGRESS_PATH) return path.resolve(process.env.CQ_PROGRESS_PATH)
  if (isServerless()) return path.join('/tmp', 'computer-quest-data', 'progress.json')
  return path.join(__dirname, 'data', 'progress.json')
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
      'User-Agent': 'computer-quest-progress-store',
    },
  })
  if (res.status === 404) return { sha: null, content: null }
  if (!res.ok) throw new Error(`GitHub progress read failed (${res.status})`)
  const body = await res.json()
  const text = Buffer.from(body.content || '', 'base64').toString('utf8')
  return { sha: body.sha, content: normalize(JSON.parse(text || '{}')) }
}

async function writeGithub(doc, sha) {
  const token = githubToken()
  if (!token) return { ok: false, reason: 'no_token' }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}`
  const payload = {
    message: `chore(progress): update durable progress ledger`,
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
      'User-Agent': 'computer-quest-progress-store',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`GitHub progress persist failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return { ok: true }
}

/**
 * Load durable progress map into memory.
 *
 * Prefer GitHub Contents API when CQ_GITHUB_TOKEN is set — raw.githubusercontent.com
 * can lag several minutes behind Contents API writes (CDN cache), which previously
 * caused cold-start loads to see an empty ledger and drop completed lessons.
 * Fall back to raw URL, then local /tmp cache.
 */
export async function loadProgressDoc({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheLoadedAt < CACHE_MS) return cache

  let fromGh = null
  if (githubToken()) {
    try {
      const meta = await readGithubMeta()
      if (meta.content) fromGh = meta.content
    } catch (e) {
      console.warn('[cq-progress] Contents API load failed, falling back to raw', e.message)
    }
  }
  if (!fromGh) {
    fromGh = await readFromGitHubRaw()
  }

  const local = readLocalFile()
  let doc = fromGh || local || emptyDoc()
  if (fromGh && local) {
    // Merge: keep the newer per-user row from either side
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

export function getDurableProgress(userId) {
  if (!userId || !cache) return null
  const row = cache.byUserId[userId]
  if (!row || typeof row !== 'object') return null
  // Strip ledger metadata for consumers
  const { updated_at, user_id, ...progress } = row
  return progress
}

/**
 * Upsert one user's progress blob and persist (GitHub when token configured).
 */
export async function saveDurableProgress(userId, progress) {
  if (!userId) return { ok: false, error: 'user_id required' }
  if (!progress || typeof progress !== 'object') return { ok: false, error: 'progress required' }

  const doc = await loadProgressDoc({ force: true })
  const next = {
    ...progress,
    user_id: userId,
    updated_at: new Date().toISOString(),
  }
  doc.byUserId[userId] = next
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
      remote.byUserId = { ...remote.byUserId, [userId]: next }
      remote.updated_at = next.updated_at
      await writeGithub(remote, meta.sha)
      cache = remote
      writeLocalFile(remote)
      persistedToGitHub = true
    } else {
      warning =
        'CQ_GITHUB_TOKEN not set — progress saved on this instance only until token is configured'
    }
  } catch (e) {
    warning = e.message || 'Failed to persist progress to GitHub'
    console.warn('[cq-progress]', warning)
  }

  return {
    ok: true,
    progress: next,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}
