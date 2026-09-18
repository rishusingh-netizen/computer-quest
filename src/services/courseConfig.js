/**
 * Course config — price and title come from the API (server course_config).
 * localStorage only caches the last successful fetch for offline display.
 */

import { COURSE as DEFAULT_COURSE } from '../config/course'
import { api } from './api'

const KEY = 'cq_course_config_v2'
const CURRICULUM_KEY = 'cq_curriculum_meta_v1'

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
  return {
    ...DEFAULT_COURSE,
    name: course.title || course.name || DEFAULT_COURSE.name,
    price: priceInr,
    priceLabel: priceInr != null ? `₹${Number(priceInr).toLocaleString('en-IN')}` : null,
    durationYears,
    durationDays: durationDays != null ? Number(durationDays) : durationYears * 365,
    pricePaise: course.pricePaise != null ? Number(course.pricePaise) : priceInr != null ? Math.round(priceInr * 100) : null,
    updatedAt: course.updated_at || course.updatedAt || null,
  }
}

export function getCourseConfig() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_COURSE }
    const overlay = JSON.parse(raw)
    return {
      ...DEFAULT_COURSE,
      ...overlay,
      includes: overlay.includes || DEFAULT_COURSE.includes,
      modules: overlay.modules || DEFAULT_COURSE.modules,
    }
  } catch {
    return { ...DEFAULT_COURSE }
  }
}

function cacheConfig(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {}
  return cfg
}

/** Load latest price/title from server; cache locally. */
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
 * Admin: persist price/title/duration on the server.
 * @param {{ price?: number, name?: string, durationYears?: number }} patch price in INR
 */
export async function saveCourseConfig(_user, patch) {
  const priceInr = patch.price != null ? Number(patch.price) : undefined
  if (priceInr !== undefined && (!Number.isFinite(priceInr) || priceInr < 0)) {
    return { ok: false, error: 'Enter a valid price in INR (0 or more).' }
  }
  const durationYears = patch.durationYears != null ? Number(patch.durationYears) : undefined
  const body = {}
  if (priceInr !== undefined) {
    const paise = Math.round(priceInr * 100)
    body.priceInr = priceInr
    body.pricePaise = paise
    body.price_paise = paise // compat with older server field names
  }
  if (durationYears !== undefined && Number.isFinite(durationYears) && durationYears > 0) {
    const days = Math.round(durationYears * 365)
    body.durationDays = days
    body.duration_days = days
  }
  if (patch.name) body.title = String(patch.name).trim()

  const res = await api.adminPatchCourse(body)
  if (res.offline) return { ok: false, error: 'Server offline — cannot save price.' }
  if (!res.ok) return { ok: false, error: res.error || 'Failed to save course settings' }

  const config = fromServerCourse(res.course) || {
    ...getCourseConfig(),
    price: priceInr,
    priceLabel: priceInr != null ? `₹${Number(priceInr).toLocaleString('en-IN')}` : null,
    name: patch.name || getCourseConfig().name,
    durationYears: durationYears || getCourseConfig().durationYears,
  }
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
