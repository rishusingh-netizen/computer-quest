/**
 * Durable course configuration store.
 *
 * Source of truth priority on READ:
 *  1. Local/server file (server/data/course-config.json or /tmp copy)
 *  2. Public GitHub raw file (survives Vercel cold starts)
 *  3. null → caller applies bootstrap default once
 *
 * On WRITE (admin save):
 *  1. Always write local/tmp file
 *  2. If CQ_GITHUB_TOKEN (or GITHUB_TOKEN) is set, commit to the repo
 *     so the next cold start still sees the price
 *
 * This is independent of localStorage and of the ephemeral users DB in /tmp.
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

function resolveLocalPath() {
  if (process.env.CQ_COURSE_CONFIG_PATH) {
    return path.resolve(process.env.CQ_COURSE_CONFIG_PATH)
  }
  const packaged = path.join(__dirname, 'data', 'course-config.json')
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'computer-quest-data', 'course-config.json')
  }
  return packaged
}

function githubToken() {
  return process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
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

function readLocalFile() {
  try {
    const p = resolveLocalPath()
    if (!fs.existsSync(p)) {
      const packaged = path.join(__dirname, 'data', 'course-config.json')
      if (packaged !== p && fs.existsSync(packaged)) {
        const raw = fs.readFileSync(packaged, 'utf8')
        return normalize(JSON.parse(raw))
      }
      return null
    }
    return normalize(JSON.parse(fs.readFileSync(p, 'utf8')))
  } catch {
    return null
  }
}

function writeLocalFile(cfg) {
  const p = resolveLocalPath()
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2))
  try {
    const packaged = path.join(__dirname, 'data', 'course-config.json')
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

let cache = { cfg: null, loadedAt: 0 }
const CACHE_MS = 15_000

export async function loadCourseConfig() {
  const now = Date.now()
  if (cache.cfg && now - cache.loadedAt < CACHE_MS) return cache.cfg

  let cfg = readLocalFile()
  if (!cfg) {
    cfg = await readFromGitHubRaw()
  }
  if (cfg) {
    cache = { cfg, loadedAt: now }
    try {
      writeLocalFile(cfg)
    } catch {
      /* ignore */
    }
  }
  return cfg
}

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
  const token = githubToken()
  if (token) {
    try {
      await writeToGitHub(next, token)
      persistedToGitHub = true
    } catch (e) {
      return {
        ok: true,
        config: next,
        persistedToGitHub: false,
        warning: e.message,
      }
    }
  }

  return { ok: true, config: next, persistedToGitHub }
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
