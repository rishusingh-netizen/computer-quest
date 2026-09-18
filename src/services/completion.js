/** Course completion evaluation for Computer Quest */

import { LEVELS } from '../data/levels'
import { PRACTICE_ACTIVITIES } from '../data/practice'
import { TESTS } from '../data/tests'

export function getTotalLessons() {
  return LEVELS.reduce((n, l) => n + (l.lessons?.length || 0), 0)
}

export function evaluateCompletion(progress) {
  if (!progress) {
    return {
      percent: 0,
      eligible: false,
      lessonsDone: 0,
      lessonsTotal: getTotalLessons(),
      practiceDone: 0,
      practiceTotal: PRACTICE_ACTIVITIES?.length || 0,
      testsPassed: 0,
      testsTotal: (TESTS || []).filter((t) => t.available !== false).length,
      missing: ['Progress data unavailable'],
    }
  }

  const lessonsTotal = getTotalLessons()
  const lessonsDone = (progress.completedLessons || []).length
  const practiceTotal = PRACTICE_ACTIVITIES?.length || 0
  const practiceDone = (progress.practiceCompleted || []).length
  const availableTests = (TESTS || []).filter((t) => t.available !== false)
  const testsTotal = availableTests.length
  const testsPassed = availableTests.filter((t) => progress.testScores?.[t.id]?.passed).length

  const lessonPct = lessonsTotal ? lessonsDone / lessonsTotal : 0
  const practicePct = practiceTotal ? practiceDone / practiceTotal : 1
  const testPct = testsTotal ? testsPassed / testsTotal : 1

  // Weighted: lessons 60%, practice 25%, tests 15%
  const percent = Math.round((lessonPct * 0.6 + practicePct * 0.25 + testPct * 0.15) * 100)

  const missing = []
  if (lessonPct < 0.9) missing.push(`Complete more lessons (${lessonsDone}/${lessonsTotal})`)
  if (practicePct < 0.7) missing.push(`Complete more practice activities (${practiceDone}/${practiceTotal})`)
  if (testPct < 0.5) missing.push(`Pass more tests (${testsPassed}/${testsTotal})`)

  const eligible = lessonPct >= 0.9 && practicePct >= 0.7 && testPct >= 0.5

  return {
    percent,
    eligible,
    lessonsDone,
    lessonsTotal,
    practiceDone,
    practiceTotal,
    testsPassed,
    testsTotal,
    missing,
  }
}
