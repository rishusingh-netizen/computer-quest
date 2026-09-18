import { COURSE as DEFAULT_COURSE } from '../config/course'

const KEY = 'cq_course_config_v1'
const CURRICULUM_KEY = 'cq_curriculum_meta_v1'

export function getCourseConfig() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_COURSE }
    const overlay = JSON.parse(raw)
    return { ...DEFAULT_COURSE, ...overlay, includes: overlay.includes || DEFAULT_COURSE.includes }
  } catch {
    return { ...DEFAULT_COURSE }
  }
}

export function saveCourseConfig(requestingUser, patch) {
  if (requestingUser?.role !== 'admin') return { ok: false, error: 'Admin only' }
  const current = getCourseConfig()
  const next = {
    ...current,
    ...patch,
    id: current.id,
    price: Number(patch.price ?? current.price),
    durationYears: Number(patch.durationYears ?? current.durationYears),
  }
  localStorage.setItem(KEY, JSON.stringify(next))
  return { ok: true, config: next }
}

export function getCurriculumMeta() {
  try {
    const raw = localStorage.getItem(CURRICULUM_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveLessonMeta(requestingUser, lessonId, meta) {
  if (requestingUser?.role !== 'admin') return { ok: false, error: 'Admin only' }
  const all = getCurriculumMeta()
  all[lessonId] = { ...(all[lessonId] || {}), ...meta, updatedAt: new Date().toISOString() }
  localStorage.setItem(CURRICULUM_KEY, JSON.stringify(all))
  return { ok: true, meta: all[lessonId] }
}
