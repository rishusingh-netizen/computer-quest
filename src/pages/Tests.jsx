import { useParams, Link } from 'react-router-dom'
import { ClipboardList } from '../components/ui/Icons'
import { TESTS, getTestById } from '../data/tests'
import { useProgress } from '../context/ProgressContext'
import TestRunner from '../components/tests/TestRunner'

export default function Tests() {
  const { testId } = useParams()
  const { testScores } = useProgress()

  if (testId) {
    const test = getTestById(testId)
    if (!test || test.available === false) {
      return (
        <div className="card">
          <p>{test?.available === false ? 'This test unlocks later.' : 'Test not found.'}</p>
          <Link to="/tests" className="btn btn-secondary mt-3">
            ← All Tests
          </Link>
        </div>
      )
    }
    return <TestRunner test={test} />
  }

  const available = TESTS.filter((t) => t.available !== false)

  return (
    <div>
      <p className="text-muted mb-4 text-sm">
        Topic-wise and level-wise tests with MCQs, scenarios and practical questions. Scores and XP
        are saved to your progress.
      </p>

      <div className="grid-2 mb-4">
        {TESTS.map((test) => {
          const locked = test.available === false
          const stats = testScores?.[test.id]
          return (
            <div key={test.id} className="card practice-card">
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--cq-primary-light)',
                    color: 'var(--cq-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  L{test.level}
                </div>
                <div>
                  <h3 className="font-semibold">{test.title}</h3>
                  <div className="flex gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                    {!locked && (
                      <>
                        <span className="badge badge-warning">+{test.xpReward} XP</span>
                        <span className="badge badge-primary">{test.questionCount} Qs</span>
                        <span className="badge badge-success">Pass {test.passPercent}%</span>
                      </>
                    )}
                    {locked && <span className="badge badge-primary">Coming later</span>}
                    {stats?.passed && <span className="badge badge-success">Passed</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted mb-3">{test.description}</p>
              {stats && stats.attempts > 0 && (
                <p className="text-sm text-muted mb-2">
                  Best: {stats.bestScore}/{stats.total || test.questionCount} ({stats.accuracy}%) ·
                  Attempts: {stats.attempts}
                </p>
              )}
              {locked ? (
                <button type="button" className="btn btn-secondary btn-sm" disabled>
                  Locked
                </button>
              ) : (
                <Link to={`/tests/${test.id}`} className="btn btn-primary btn-sm">
                  {stats?.attempts > 0 ? 'Retake Test' : 'Start Test'}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {available.length === 0 && (
        <div className="card page-placeholder" style={{ padding: 32 }}>
          <div className="icon-wrap">
            <ClipboardList size={28} />
          </div>
          <h2>No tests available yet</h2>
        </div>
      )}
    </div>
  )
}
