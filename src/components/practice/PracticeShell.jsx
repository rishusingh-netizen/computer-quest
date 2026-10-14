import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Star, ArrowRight } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

export default function PracticeShell({ activity, children }) {
  const { completePractice, isPracticeCompleted, practiceScores } = useProgress()
  const [phase, setPhase] = useState('intro')
  const [result, setResult] = useState(null)

  const alreadyDone = isPracticeCompleted(activity.id)

  function handleComplete(score, total) {
    const xpEarned = alreadyDone ? 0 : activity.xpReward
    completePractice(activity.id, score, total, xpEarned)
    setResult({ score, total, xpEarned })
    setPhase('result')
  }

  function handleRetry() {
    setResult(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <div className="practice-shell">
        <Link to="/practice" className="back-link">
          ← All Practices
        </Link>
        <div className="card practice-intro">
          <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Level {activity.level}</span>
            <span className="badge badge-warning">+{activity.xpReward} XP</span>
            {alreadyDone && (
              <span className="badge badge-success">
                <CheckCircle size={12} /> Completed
              </span>
            )}
          </div>
          <h2 className="practice-title">{activity.title}</h2>
          <p className="text-muted mb-3">{activity.description}</p>
          <p className="text-sm mb-4">Interactive simulation — practice the skill, then finish to save progress.</p>
          <button type="button" className="btn btn-primary" onClick={() => setPhase('play')}>
            Start Practice →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 100
    return (
      <div className="practice-shell">
        <Link to="/practice" className="back-link">
          ← All Practices
        </Link>
        <div className="card practice-result" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h2 className="practice-title">Practice Complete!</h2>
          <p className="mt-2">
            Score: <strong>{result.score}</strong> / {result.total} ({pct}%)
          </p>
          {result.xpEarned > 0 ? (
            <p className="mt-2" style={{ color: '#047857', fontWeight: 600 }}>
              <Star size={16} style={{ verticalAlign: 'middle' }} /> +{result.xpEarned} XP earned
            </p>
          ) : (
            <p className="text-sm text-muted mt-2">Already completed earlier — score updated, no extra XP.</p>
          )}
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleRetry}>
              Retry
            </button>
            <Link to="/practice" className="btn btn-primary">
              More Practices <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="practice-shell">
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPhase('intro')}>
          ← Exit
        </button>
        <span className="badge badge-primary">{activity.title}</span>
      </div>
      {typeof children === 'function' ? children({ onComplete: handleComplete }) : children}
    </div>
  )
}
