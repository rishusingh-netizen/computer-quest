/**
 * Lesson registry – Levels 1–9.
 */

import { getLevel1Lesson, LEVEL1_LESSONS } from './level1.js'
import { getLevel2Lesson, LEVEL2_LESSONS } from './level2.js'
import { getLevel3Lesson, LEVEL3_LESSONS } from './level3.js'
import { getLevel4Lesson, LEVEL4_LESSONS } from './level4.js'
import { getLevel5Lesson, LEVEL5_LESSONS } from './level5.js'
import { getLevel6Lesson, LEVEL6_LESSONS } from './level6.js'
import { getLevel7Lesson, LEVEL7_LESSONS } from './level7.js'
import { getLevel8Lesson, LEVEL8_LESSONS } from './level8.js'
import { getLevel9Lesson, LEVEL9_LESSONS } from './level9.js'

const LEVEL_MAP = [
  [LEVEL1_LESSONS, getLevel1Lesson, 'l1-'],
  [LEVEL2_LESSONS, getLevel2Lesson, 'l2-'],
  [LEVEL3_LESSONS, getLevel3Lesson, 'l3-'],
  [LEVEL4_LESSONS, getLevel4Lesson, 'l4-'],
  [LEVEL5_LESSONS, getLevel5Lesson, 'l5-'],
  [LEVEL6_LESSONS, getLevel6Lesson, 'l6-'],
  [LEVEL7_LESSONS, getLevel7Lesson, 'l7-'],
  [LEVEL8_LESSONS, getLevel8Lesson, 'l8-'],
  [LEVEL9_LESSONS, getLevel9Lesson, 'l9-'],
]

export function getLessonById(id) {
  if (!id) return null
  for (const [, getter] of LEVEL_MAP) {
    const lesson = getter(id)
    if (lesson) return lesson
  }
  return null
}

export function getLessonsForLevel(levelId) {
  const idx = Math.max(0, Math.min(8, (Number(levelId) || 1) - 1))
  const lessonsObj = LEVEL_MAP[idx]?.[0] || {}
  return Object.values(lessonsObj)
}

export function hasFullLesson(id) {
  return Boolean(getLessonById(id))
}

export function getSiblingLessonIds(lessonId) {
  if (!lessonId) return []
  for (const [lessons, , prefix] of LEVEL_MAP) {
    if (lessonId.startsWith(prefix)) return Object.keys(lessons)
  }
  return []
}

export function getAdjacentLessons(lessonId) {
  const ids = getSiblingLessonIds(lessonId)
  const i = ids.indexOf(lessonId)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? ids[i - 1] : null,
    next: i < ids.length - 1 ? ids[i + 1] : null,
  }
}

export {
  LEVEL1_LESSONS,
  LEVEL2_LESSONS,
  LEVEL3_LESSONS,
  LEVEL4_LESSONS,
  LEVEL5_LESSONS,
  LEVEL6_LESSONS,
  LEVEL7_LESSONS,
  LEVEL8_LESSONS,
  LEVEL9_LESSONS,
}
