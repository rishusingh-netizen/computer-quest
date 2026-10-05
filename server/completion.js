/**
 * Server-side course completion eligibility.
 * Mirrors src/services/completion.js so certificates cannot be issued
 * without meeting the full-course requirements.
 */

const REQUIRED_LESSON_PREFIXES = ['l1-', 'l2-', 'l3-', 'l4-', 'l5-', 'l6-', 'l7-', 'l8-', 'l9-']

// Must stay aligned with frontend LEVELS lesson counts (57 total)
const REQUIRED_LESSON_COUNTS = {
  1: 11,
  2: 5,
  3: 7,
  4: 5,
  5: 5,
  6: 5,
  7: 5,
  8: 7,
  9: 7,
}

const REQUIRED_TEST_IDS = [
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

const MIN_PRACTICE = 8
const MIN_REVISION = 10
const MIN_PASSED_TESTS = 9
const MIN_GAMES = 2

/**
 * @param {object} progress - stored progress row data
 * @param {object} [cfg] - optional durable course config with completion_json
 */
export function evaluateServerCompletion(progress, cfg = null) {
  const p = progress || {}
  const completedLessons = Array.isArray(p.completedLessons) ? p.completedLessons : []
  const practiceCompleted = Array.isArray(p.practiceCompleted) ? p.practiceCompleted : []
  const revisionCompleted = Array.isArray(p.revisionCompleted) ? p.revisionCompleted : []
  const testScores = p.testScores && typeof p.testScores === 'object' ? p.testScores : {}
  const gamesPlayed = p.gamesPlayed && typeof p.gamesPlayed === 'object' ? p.gamesPlayed : {}

  let minPractice = MIN_PRACTICE
  let minRevision = MIN_REVISION
  let minPassedTests = MIN_PASSED_TESTS
  let minGames = MIN_GAMES
  if (cfg?.completion_json) {
    try {
      const rules =
        typeof cfg.completion_json === 'string' ? JSON.parse(cfg.completion_json) : cfg.completion_json
      if (Number.isFinite(Number(rules.minPracticeCount))) minPractice = Number(rules.minPracticeCount)
      if (Number.isFinite(Number(rules.minRevisionCount))) minRevision = Number(rules.minRevisionCount)
      if (Number.isFinite(Number(rules.minPassedTests))) minPassedTests = Number(rules.minPassedTests)
      if (Number.isFinite(Number(rules.minGamesPlayed))) minGames = Number(rules.minGamesPlayed)
    } catch {
      /* keep defaults */
    }
  }

  // Lesson coverage: every level must have its expected count completed
  let lessonsOk = true
  let lessonsDone = 0
  let lessonsTotal = 0
  for (const [level, count] of Object.entries(REQUIRED_LESSON_COUNTS)) {
    const prefix = `l${level}-`
    const done = completedLessons.filter((id) => String(id).startsWith(prefix)).length
    lessonsDone += Math.min(done, count)
    lessonsTotal += count
    if (done < count) lessonsOk = false
  }
  const hasCurriculumLessons = completedLessons.some((id) =>
    REQUIRED_LESSON_PREFIXES.some((p) => String(id).startsWith(p))
  )
  if (!hasCurriculumLessons) lessonsOk = false

  const practiceOk = practiceCompleted.length >= minPractice
  const revisionOk = revisionCompleted.length >= minRevision
  const gamesOk = Object.keys(gamesPlayed).length >= minGames

  const testsPassed = REQUIRED_TEST_IDS.filter((id) => {
    const t = testScores[id]
    if (!t) return false
    if (t.passed === true) return true
    return (t.accuracy || 0) >= 60 || (t.bestScore && t.total && t.bestScore / t.total >= 0.6)
  })
  const testsOk = testsPassed.length >= minPassedTests

  const eligible = lessonsOk && practiceOk && revisionOk && gamesOk && testsOk

  return {
    eligible,
    snapshot: {
      lessonsDone,
      lessonsTotal,
      practiceCount: practiceCompleted.length,
      revisionCount: revisionCompleted.length,
      testsPassed: testsPassed.length,
      gamesPlayed: Object.keys(gamesPlayed).length,
      minPractice,
      minRevision,
      minPassedTests,
      minGames,
    },
  }
}
