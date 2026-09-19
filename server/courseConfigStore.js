/**
 * Production-ready durable course configuration store.
 *
 * Source of truth for the live course PRICE is the committed file
 *   server/data/course-config.json
 * in the GitHub repo (public raw URL for reads; Contents API for writes).
 *
 * Why not only the JSON DB under /tmp?
 *   Vercel serverless instances are ephemeral. /tmp does not survive
 *   cold starts or scale-out. localStorage is browser-only and must never
 *   be the admin source of truth.
 *
 * READ priority:
 *  1. On Vercel / Lambda: GitHub raw first (cross-instance source of truth)
 *  2. Local or /tmp file (fast path / write-through cache)
 *  3. Packaged file shipped with the deployment
 *  4. null → caller may apply a one-time bootstrap (never a hard-coded live price)
 *
 * WRITE (admin save):
 *  1. Always write local/tmp (and packaged path when writable)
 *  2. If CQ_GITHUB_TOKEN (or GITHUB_TOKEN) is set, commit to the repo so
 *     every future cold start and every instance sees the new price
 *  3. Return persistedToGitHub so the admin UI can confirm permanence
 *
 * This module is independent of browser localStorage and of the users DB.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const CONFIG_PATH_IN_REPO = 'server/data/course-config.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${CONFIG_PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function resolveLocalPath() {
  if (process.env.CQ_COURSE_CONFIG_PATH) {
    return path.resolve(process.env.CQ_COURSE_CONFIG_PATH)
  }
  // Prefer package data dir locally; on Vercel keep a /tmp mirror for fast writes
  const packaged = path.join(__dirname, 'data', 'course-config.json')
  if (isServerless()) {
    return path.join('/tmp', 'computer-quest-data', 'course-config.json')
  }
  return packaged
}

function packagedPath() {
  return path.join(__dirname, 'data', 'course-config.json')
}

function githubToken() {
  // Trim in case the Vercel env value was pasted with whitespace/newlines
  const t = process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  return String(t).trim()
}

function normalize(cfg) {
  if (!cfg || typeof cfg !== 'object') return null
  const pricePaise = Number(cfg.price_paise ?? cfg.pricePaise)
  if (!Number.isFinite(pricePaise) || pricePaise < 0) return null
  const durationDays = Number(cfg.duration_days ?? cfg.durationDays ?? 730)
  return {
    id: 1,
    price_paise: Math.round(pricePaise),
    duration_days: Number.isFinite(durationDays) && durationDays > 0 ? Math.round(durationDays) : 730,
    title: String(cfg.title || 'Computer Quest').trim() || 'Computer Quest',
    completion_json:
      typeof cfg.completion_json === 'string'
        ? cfg.completion_json
        : JSON.stringify(
            cfg.completion || {
              mode: 'full_course',
              requireAllLessonsFromLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
              minPracticeCount: 8,
              minRevisionCount: 10,
              minPassedTests: 9,
              minGamesPlayed: 2,
            }
          ),
    updated_at: cfg.updated_at || cfg.updatedAt || new Date().toISOString(),
  }
}

function ts(cfg) {
  if (!cfg?.updated_at) return 0
  const t = Date.parse(cfg.updated_at)
  return Number.isFinite(t) ? t : 0
}

/** Pick the config with the newest updated_at (prefer non-null). */
function newest(a, b) {
  if (!a) return b
  if (!b) return a
  return ts(a) >= ts(b) ? a : b
}

function readLocalFile() {
  try {
    const p = resolveLocalPath()
    if (fs.existsSync(p)) {
      return normalize(JSON.parse(fs.readFileSync(p, 'utf8')))
    }
    // Packaged path when running on Vercel (read-only copy from deploy)
    const packaged = packagedPath()
    if (packaged !== p && fs.existsSync(packaged)) {
      return normalize(JSON.parse(fs.readFileSync(packaged, 'utf8')))
    }
    return null
  } catch {
    return null
  }
}

function writeLocalFile(cfg) {
  const p = resolveLocalPath()
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2))
  // Best-effort: also update packaged path when writable (local dev)
  try {
    const packaged = packagedPath()
    if (packaged !== p) {
      const pkgDir = path.dirname(packaged)
      if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(packaged, JSON.stringify(cfg, null, 2))
    }
  } catch {
    /* read-only on Vercel */
  }
}

async function readFromGitHubRaw() {
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'computer-quest-api' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return normalize(data)
  } catch {
    return null
  }
}

async function getGitHubFileSha(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONFIG_PATH_IN_REPO}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'computer-quest-api',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.sha || null
}

async function writeToGitHub(cfg, token) {
  const sha = await getGitHubFileSha(token)
  const body = {
    message: `chore: update course price to ₹${Math.round(cfg.price_paise / 100)} (${cfg.updated_at})`,
    content: Buffer.from(JSON.stringify(cfg, null, 2), 'utf8').toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONFIG_PATH_IN_REPO}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'computer-quest-api',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`GitHub persist failed (${res.status}): ${errText.slice(0, 200)}`)
  }
  return true
}

/** In-process cache to avoid hitting GitHub on every request */
let cache = { cfg: null, loadedAt: 0 }
const CACHE_MS = 10_000 // redeploy: pick up CQ_GITHUB_TOKEN

/**
 * Load durable course config (never from localStorage / browser).
 * On serverless, GitHub raw is preferred so every instance agrees.
 */
export async function loadCourseConfig() {
  const now = Date.now()
  if (cache.cfg && now - cache.loadedAt < CACHE_MS) return cache.cfg

  let local = readLocalFile()
  let remote = null

  // On Vercel always consult GitHub first so cold starts and scale-out
  // share one permanent price. Locally, GitHub is still consulted and
  // we keep the newest by updated_at.
  remote = await readFromGitHubRaw()

  let cfg
  if (isServerless()) {
    // Production: GitHub is the permanent cross-instance source of truth.
    // Prefer the newest updated_at so a just-committed price wins over a
    // stale /tmp cache, and a warmer /tmp still loses to a newer commit.
    cfg = newest(remote, local) || remote || local
  } else {
    // Local development: disk file is the working store (no token required).
    // GitHub is only a fallback when the local file is missing.
    cfg = local || remote
  }

  if (cfg) {
    cache = { cfg, loadedAt: now }
    // Warm local/tmp for subsequent reads in this instance
    try {
      writeLocalFile(cfg)
    } catch {
      /* ignore */
    }
  }
  return cfg
}

/**
 * Persist course config durably.
 * @returns {{ ok: boolean, config?: object, persistedToGitHub?: boolean, durable?: boolean, warning?: string, error?: string }}
 */
export async function saveCourseConfig(partial) {
  const current = (await loadCourseConfig()) || {
    id: 1,
    price_paise: 0,
    duration_days: 730,
    title: 'Computer Quest',
    completion_json: JSON.stringify({
      mode: 'full_course',
      requireAllLessonsFromLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      minPracticeCount: 8,
      minRevisionCount: 10,
      minPassedTests: 9,
      minGamesPlayed: 2,
    }),
    updated_at: new Date().toISOString(),
  }

  const next = normalize({
    ...current,
    ...partial,
    price_paise: partial.price_paise ?? current.price_paise,
    duration_days: partial.duration_days ?? current.duration_days,
    title: partial.title ?? current.title,
    completion_json: partial.completion_json ?? current.completion_json,
    updated_at: new Date().toISOString(),
  })

  if (!next) return { ok: false, error: 'Invalid course configuration' }

  try {
    writeLocalFile(next)
  } catch (e) {
    return { ok: false, error: `Failed to write local config: ${e.message}` }
  }

  cache = { cfg: next, loadedAt: Date.now() }

  let persistedToGitHub = false
  let warning
  const token = githubToken()
  if (token) {
    try {
      await writeToGitHub(next, token)
      persistedToGitHub = true
    } catch (e) {
      // Local write succeeded; GitHub is required for cross-instance durability
      warning = e.message
    }
  } else if (isServerless()) {
    warning =
      'CQ_GITHUB_TOKEN is not set. Price was saved on this instance only and may reset after a cold start. Add a fine-scoped GitHub token (Contents: Read & Write) in Vercel env for permanent production pricing.'
  }

  return {
    ok: true,
    config: next,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}

export function clearCourseConfigCache() {
  cache = { cfg: null, loadedAt: 0 }
}

export function courseConfigToPublic(cfg) {
  if (!cfg) return null
  const pricePaise = Number(cfg.price_paise) || 0
  return {
    title: cfg.title,
    name: cfg.title,
    pricePaise,
    priceInr: Math.round(pricePaise / 100),
    durationDays: cfg.duration_days,
    durationYears: Math.max(1, Math.round((cfg.duration_days || 730) / 365)),
    completion: (() => {
      try {
        return JSON.parse(cfg.completion_json || '{}')
      } catch {
        return {}
      }
    })(),
    updatedAt: cfg.updated_at || null,
  }
}
