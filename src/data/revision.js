import { REVISION_PART_A } from './revisionPartA.js'
import { REVISION_PART_B } from './revisionPartB.js'

export const REVISION_TOPICS = [...REVISION_PART_A, ...REVISION_PART_B]

export function getRevisionTopic(id) {
  const t = REVISION_TOPICS.find((x) => x.id === id) || null
  if (!t) return null
  return { ...t, description: t.description || t.summary || '' }
}

export function getAllRevisionTopics() {
  return REVISION_TOPICS.map((t) => ({ ...t, description: t.description || t.summary || '' }))
}

export function analyzeRevisionTopics(progress = {}) {
  const { completedLessons = [], revisionScores = {}, weakTopics = [] } = progress
  const weakSet = new Set(weakTopics || [])
  return REVISION_TOPICS.filter(Boolean).map((topic) => {
    const lessonsDone = (topic.lessonIds || []).filter((id) => completedLessons.includes(id))
    const matchedWeak = (topic.matchTopics || []).some((m) => weakSet.has(m))
    const rev = revisionScores[topic.id]
    const revised = !!(rev && (rev.attempts || 0) > 0)
    let status = 'available'
    if (matchedWeak) status = 'weak'
    if (revised && !matchedWeak) status = 'revised'
    return {
      ...topic,
      learned: lessonsDone.length > 0,
      recentlyLearned: false,
      isWeak: matchedWeak,
      revised,
      status,
      accuracy: rev?.accuracy ?? null,
      lastScore: rev?.lastScore ?? null,
      lastTotal: rev?.lastTotal ?? null,
      attempts: rev?.attempts || 0,
      lessonsDone: lessonsDone.length,
      lessonsTotal: (topic.lessonIds || []).length,
    }
  })
}
