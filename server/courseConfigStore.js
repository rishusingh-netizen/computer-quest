/**
 * Production-ready durable course configuration store.
 *
 * Source of truth for live PRICING and PLANS is the committed file
 *   server/data/course-config.json
 * in the GitHub repo (public raw URL for reads; Contents API for writes).
 *
 * Supports:
 *  - Legacy single price (price_paise / duration_days) for backward compatibility
 *  - Multiple enrollment plans (plans[]) — admin editable, never permanently fixed
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
  const t = process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  return String(t).trim()
}

/** Default plan definitions (structure + features). Prices are not permanent — admin sets any INR. */
export function defaultPlans(seedPricePaise = 0) {
  const fullPrice = Number.isFinite(Number(seedPricePaise)) ? Math.max(0, Math.round(Number(seedPricePaise))) : 0
  return [
    {
      id: 'plan-6m',
      name: '6 Months – Essential',
      description:
        'Core computer skills for beginners: Windows, typing, Word, basic Excel & PowerPoint, internet, email and cyber safety with practice and tests.',
      price_paise: 0,
      duration_days: 182,
      active: true,
      sort_order: 1,
      tier: 'essential',
      features: [
        'Important computer basics',
        'Windows / File Management',
        'Keyboard + Typing',
        'MS Word',
        'Basic Excel',
        'Basic PowerPoint',
        'Internet & Email',
        'Basic Cyber Safety',
        'Basic tests + practice',
      ],
    },
    {
      id: 'plan-1y',
      name: '1 Year – Complete',
      description:
        'Everything in Essential plus advanced Office skills, more projects, practice, tests, revision, games, Quest Helper, progress tracking and certificate.',
      price_paise: 0,
      duration_days: 365,
      active: true,
      sort_order: 2,
      tier: 'complete',
      features: [
        'Everything in 6 Months – Essential',
        'Advanced Word',
        'Advanced Excel',
        'Advanced PowerPoint',
        'More practical projects',
        'More practice, tests, revision and games',
        'Quest Helper',
        'Progress + XP / Streak',
        'Certificate',
      ],
    },
    {
      id: 'plan-2y',
      name: '2 Years – Full Computer Quest',
      description:
        'Complete Level 1–9 curriculum with all Practice Labs, Game Zone, tests, revision, Quest Helper, projects, certificate and future course updates during access.',
      price_paise: fullPrice,
      duration_days: 730,
      active: true,
      sort_order: 3,
      tier: 'full',
      features: [
        'Complete Level 1–9 curriculum',
        'All Practice Labs',
        'Game Zone',
        'Tests',
        'Revision',
        'Quest Helper',
        'Projects',
        'Certificate',
        'Future course content during access (when released)',
      ],
    },
  ]
}

function normalizePlan(p, index = 0) {
  if (!p || typeof p !== 'object') return null
  const id = String(p.id || `plan-${index + 1}`).trim()
  if (!id) return null
  let pricePaise = Number(p.price_paise ?? p.pricePaise)
  if (!Number.isFinite(pricePaise) && p.priceInr != null) {
    pricePaise = Math.round(Number(p.priceInr) * 100)
  }
  if (!Number.isFinite(pricePaise)) pricePaise = 0
  const durationDays = Number(p.duration_days ?? p.durationDays ?? 365)
  const features = Array.isArray(p.features)
    ? p.features.map((f) => String(f).trim()).filter(Boolean)
    : []
  return {
    id,
    name: String(p.name || id).trim() || id,
    description: String(p.description || '').trim(),
    price_paise: Number.isFinite(pricePaise) && pricePaise >= 0 ? Math.round(pricePaise) : 0,
    duration_days: Number.isFinite(durationDays) && durationDays > 0 ? Math.round(durationDays) : 365,
    active: p.active !== false && p.active !== 'false' && p.active !== 0,
    sort_order: Number.isFinite(Number(p.sort_order ?? p.sortOrder))
      ? Math.round(Number(p.sort_order ?? p.sortOrder))
      : index + 1,
    tier: String(p.tier || 'full').trim() || 'full',
    features,
  }
}

function normalizePlans(rawPlans, seedPricePaise = 0) {
  if (Array.isArray(rawPlans) && rawPlans.length > 0) {
    const out = rawPlans.map((p, i) => normalizePlan(p, i)).filter(Boolean)
    if (out.length) {
      out.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      return out
    }
  }
  return defaultPlans(seedPricePaise)
}

function normalize(cfg) {
  if (!cfg || typeof cfg !== 'object') return null
  const pricePaise = Number(cfg.price_paise ?? cfg.pricePaise)
  if (!Number.isFinite(pricePaise) || pricePaise < 0) {
    // Allow 0 and missing when plans carry prices
    if (!Array.isArray(cfg.plans) || !cfg.plans.length) return null
  }
  const safePaise = Number.isFinite(pricePaise) && pricePaise >= 0 ? Math.round(pricePaise) : 0
  const durationDays = Number(cfg.duration_days ?? cfg.durationDays ?? 730)
  const plans = normalizePlans(cfg.plans, safePaise)
  // Legacy primary price: prefer active plan-2y, else first active, else safePaise
  const primary =
    plans.find((p) => p.id === 'plan-2y' && p.active) ||
    plans.find((p) => p.active) ||
    plans[0]
  return {
    id: 1,
    price_paise: primary ? primary.price_paise : safePaise,
    duration_days:
      primary && primary.duration_days
        ? primary.duration_days
        : Number.isFinite(durationDays) && durationDays > 0
          ? Math.round(durationDays)
          : 730,
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
    plans,
    updated_at: cfg.updated_at || cfg.updatedAt || new Date().toISOString(),
  }
}

function ts(cfg) {
  if (!cfg?.updated_at) return 0
  const t = Date.parse(cfg.updated_at)
  return Number.isFinite(t) ? t : 0
}

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
    message: `chore: update course plans/pricing (${cfg.updated_at})`,
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
const CACHE_MS = 10_000

export async function loadCourseConfig() {
  const now = Date.now()
  if (cache.cfg && now - cache.loadedAt < CACHE_MS) return cache.cfg

  let local = readLocalFile()
  let remote = await readFromGitHubRaw()

  let cfg
  if (isServerless()) {
    cfg = newest(remote, local) || remote || local
  } else {
    cfg = local || remote
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
    plans: defaultPlans(0),
    updated_at: new Date().toISOString(),
  }

  let plans = current.plans
  if (partial.plans != null) {
    plans = normalizePlans(partial.plans, partial.price_paise ?? current.price_paise)
  }

  const next = normalize({
    ...current,
    ...partial,
    plans,
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
      warning = e.message
    }
  } else if (isServerless()) {
    warning =
      'CQ_GITHUB_TOKEN is not set. Config was saved on this instance only and may reset after a cold start. Add a fine-scoped GitHub token (Contents: Read & Write) in Vercel env for permanent production pricing.'
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

export function findPlan(cfg, planId) {
  if (!cfg?.plans?.length) return null
  const id = String(planId || '').trim()
  if (!id) return null
  return cfg.plans.find((p) => p.id === id) || null
}

export function courseConfigToPublic(cfg) {
  if (!cfg) return null
  const pricePaise = Number(cfg.price_paise) || 0
  const plans = (cfg.plans || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    pricePaise: p.price_paise,
    priceInr: Math.round((p.price_paise || 0) / 100),
    durationDays: p.duration_days,
    durationMonths: Math.max(1, Math.round((p.duration_days || 30) / 30)),
    durationYears: Math.max(1, Math.round((p.duration_days || 365) / 365)),
    active: !!p.active,
    sortOrder: p.sort_order,
    tier: p.tier,
    features: p.features || [],
  }))
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
    plans,
    updatedAt: cfg.updated_at || null,
  }
}
