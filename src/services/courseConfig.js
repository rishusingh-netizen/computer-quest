/**
 * Course config — price, title and plans come from the API (server durable store).
 * localStorage only caches the last successful fetch for offline display.
 */

import { COURSE as DEFAULT_COURSE } from '../config/course'
import { api } from './api'

const KEY = 'cq_course_config_v3'
const CURRICULUM_KEY = 'cq_curriculum_meta_v1'

function mapPlan(p) {
  if (!p) return null
  const priceInr =
    p.priceInr != null
      ? Number(p.priceInr)
      : p.pricePaise != null
        ? Math.round(Number(p.pricePaise) / 100)
        : p.price_paise != null
          ? Math.round(Number(p.price_paise) / 100)
          : null
  const durationDays = Number(p.durationDays ?? p.duration_days ?? 365)
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: priceInr,
    pricePaise: p.pricePaise != null ? Number(p.pricePaise) : priceInr != null ? Math.round(priceInr * 100) : 0,
    durationDays,
    durationMonths: p.durationMonths ?? Math.max(1, Math.round(durationDays / 30)),
    durationYears: p.durationYears ?? Math.max(1, Math.round(durationDays / 365)),
    active: p.active !== false,
    sortOrder: p.sortOrder ?? p.sort_order ?? 0,
    tier: p.tier || 'full',
    features: Array.isArray(p.features) ? p.features : [],
  }
}

function fromServerCourse(course) {
  if (!course) return null
  const priceInr =
    course.priceInr != null
      ? Number(course.priceInr)
      : course.pricePaise != null
        ? Math.round(Number(course.pricePaise) / 100)
        : course.price_paise != null
          ? Math.round(Number(course.price_paise) / 100)
          : course.price != null
            ? Number(course.price)
            : null
  const durationDays = course.durationDays ?? course.duration_days
  const durationYears =
    course.durationYears != null
      ? Number(course.durationYears)
      : durationDays != null
        ? Math.max(1, Math.round(Number(durationDays) / 365))
        : DEFAULT_COURSE.durationYears
  const plans = Array.isArray(course.plans) ? course.plans.map(mapPlan).filter(Boolean) : []
  return {
    ...DEFAULT_COURSE,
    name: course.title || course.name || DEFAULT_COURSE.name,
    price: priceInr,
    priceLabel: priceInr != null ? `₹${Number(priceInr).toLocaleString('en-IN')}` : null,
    durationYears,
    durationDays: durationDays != null ? Number(durationDays) : durationYears * 365,
    pricePaise:
      course.pricePaise != null
        ? Number(course.pricePaise)
        : priceInr != null
          ? Math.round(priceInr * 100)
          : null,
    plans,
    updatedAt: course.updated_at || course.updatedAt || null,
  }
}

export function getCourseConfig() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_COURSE, plans: [] }
    const overlay = JSON.parse(raw)
    return {
      ...DEFAULT_COURSE,
      ...overlay,
      includes: overlay.includes || DEFAULT_COURSE.includes,
      modules: overlay.modules || DEFAULT_COURSE.modules,
      plans: Array.isArray(overlay.plans) ? overlay.plans : [],
    }
  } catch {
    return { ...DEFAULT_COURSE, plans: [] }
  }
}

function cacheConfig(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {}
  return cfg
}

/** Load latest price/title/plans from server; cache locally. */
export async function fetchCourseConfig() {
  const res = await api.course()
  if (res.offline || !res.ok) {
    return { ok: false, offline: !!res.offline, config: getCourseConfig(), error: res.error }
  }
  const config = fromServerCourse(res.course)
  cacheConfig(config)
  return {
    ok: true,
    config,
    persistedToGitHub: !!res.persistedToGitHub,
    durable: !!res.durable,
    warning: res.warning,
  }
}

/**
 * Admin: persist price/title/duration and/or full plans array on the server.
 */
export async function saveCourseConfig(_user, patch) {
  const body = {}
  if (patch.price != null) {
    const priceInr = Number(patch.price)
    if (!Number.isFinite(priceInr) || priceInr < 0) {
      return { ok: false, error: 'Enter a valid price in INR (0 or more).' }
    }
    const paise = Math.round(priceInr * 100)
    body.priceInr = priceInr
    body.pricePaise = paise
    body.price_paise = paise
  }
  if (patch.durationYears != null) {
    const durationYears = Number(patch.durationYears)
    if (Number.isFinite(durationYears) && durationYears > 0) {
      const days = Math.round(durationYears * 365)
      body.durationDays = days
      body.duration_days = days
    }
  }
  if (patch.name) body.title = String(patch.name).trim()
  if (Array.isArray(patch.plans)) {
    body.plans = patch.plans.map((p, i) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      priceInr: Number(p.price) || 0,
      pricePaise: Math.round((Number(p.price) || 0) * 100),
      price_paise: Math.round((Number(p.price) || 0) * 100),
      durationDays: Number(p.durationDays) || 365,
      duration_days: Number(p.durationDays) || 365,
      active: p.active !== false,
      sortOrder: p.sortOrder ?? i + 1,
      sort_order: p.sortOrder ?? i + 1,
      tier: p.tier || 'full',
      features: Array.isArray(p.features) ? p.features : [],
    }))
  }

  const res = await api.adminPatchCourse(body)
  if (res.offline) return { ok: false, error: 'Server offline — cannot save course settings.' }
  if (!res.ok) return { ok: false, error: res.error || 'Failed to save course settings' }

  const config = fromServerCourse(res.course) || getCourseConfig()
  cacheConfig(config)
  return {
    ok: true,
    config,
    persistedToGitHub: !!res.persistedToGitHub,
    durable: !!res.durable,
    warning: res.warning,
  }
}

export function getCurriculumMeta() {
  try {
    return JSON.parse(localStorage.getItem(CURRICULUM_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveLessonMeta(lessonId, meta) {
  const all = getCurriculumMeta()
  all[lessonId] = { ...(all[lessonId] || {}), ...meta }
  try {
    localStorage.setItem(CURRICULUM_KEY, JSON.stringify(all))
  } catch {}
  return all
}
