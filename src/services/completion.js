/** Course completion evaluation for Computer Quest (UI display).
 * Server evaluateServerCompletion remains the authority for certificate issue.
 */

import { LEVELS } from '../data/levels'
import { PRACTICE_ACTIVITIES } from '../data/practice'

/** Must stay aligned with server/completion.js REQUIRED_TEST_IDS (9 total). */
export const REQUIRED_TEST_IDS = [
  'level1-basics',
  'level2-typing',
  'level3-office',
  'level4-internet',
  'level5-security',
  'level6-design',
  'level7-ai',
  'level8-programming',
  'level9-advanced',
]

const LOCKED_TEST_IDS = new Set(['level7-ai', 'level8-programming', 'level9-advanced'])

export function getTotalLessons() {
  return LEVELS.reduce((n, l) => n + (l.lessons?.length || 0), 0)
}

function isTestPassed(entry) {
  if (!entry) return false
  if (entry.passed === true) return true
  return (entry.accuracy || 0) >= 60 || (entry.bestScore && entry.total && entry.bestScore / entry.total >= 0.6)
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
      testsTotal: REQUIRED_TEST_IDS.length,
      missing: ['Progress data unavailable'],
    }
  }

  const lessonsTotal = getTotalLessons()
  const lessonsDone = (progress.completedLessons || []).length
  const practiceTotal = PRACTICE_ACTIVITIES?.length || 0
  const practiceDone = (progress.practiceCompleted || []).length

  // Certificate eligibility requires all 9 level tests (same as server).
  // L7–L9 may still be locked in the Tests UI but remain required for the certificate.
  const testsTotal = REQUIRED_TEST_IDS.length
  const testsPassed = REQUIRED_TEST_IDS.filter((id) => isTestPassed(progress.testScores?.[id])).length

  const lessonPct = lessonsTotal ? lessonsDone / lessonsTotal : 0
  const practicePct = practiceTotal ? practiceDone / practiceTotal : 1
  const testPct = testsTotal ? testsPassed / testsTotal : 0

  const percent = Math.round((lessonPct * 0.6 + practicePct * 0.25 + testPct * 0.15) * 100)

  const missing = []
  if (lessonsDone < lessonsTotal) missing.push(`Complete more lessons (${lessonsDone}/${lessonsTotal})`)
  if (practiceDone < 8) missing.push(`Complete more practice activities (${practiceDone}/${practiceTotal || 16})`)
  if (testsPassed < testsTotal) {
    missing.push(
      `Pass more level tests (${testsPassed}/${testsTotal}). Level 7–9 formal tests unlock later but are required for the certificate.`
    )
  }

  // UI eligibility hint only — server still enforces full rules on issue.
  const eligible =
    lessonsDone >= lessonsTotal &&
    practiceDone >= 8 &&
    testsPassed >= testsTotal

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
