import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

export default function PracticeShell({ activity, children, completed, onComplete }) {
  const { isPracticeCompleted, practiceScores } = useProgress()
  const [phase, setPhase] = useState('intro')
  const [result, setResult] = useState(null)

  const alreadyDone = completed ?? isPracticeCompleted(activity?.id)
  const prevScore = practiceScores?.[activity?.id]

  function handleComplete(score, total) {
    const xpEarned = alreadyDone ? 0 : (activity?.xpReward || 20)
    if (onComplete) onComplete(score, total, xpEarned)
    setResult({ score, total, xpEarned })
    setPhase('result')
  }

  if (!activity) return <div className="card">Activity not found</div>

  if (phase === 'intro') {
    return (
      <div className="practice-shell">
        <Link to="/practice" className="text-sm" style={{ color: 'var(--cq-primary)' }}>← All Practices</Link>
        <div className="card mt-3">
          <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Level {activity.level}</span>
            {activity.difficulty && <span className="badge badge-warning">{activity.difficulty}</span>}
            <span className="badge badge-warning">+{activity.xpReward || 20} XP</span>
            {alreadyDone && <span className="badge badge-success">Completed</span>}
          </div>
          <h2 className="card-title">{activity.title}</h2>
          <p className="text-sm text-muted mb-3">{activity.description}</p>
          {activity.instructions && <p className="text-sm mb-3">{activity.instructions}</p>}
          {prevScore && (
            <p className="text-sm text-muted mb-3">Best: {prevScore.bestScore} · Attempts: {prevScore.attempts}</p>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setPhase('play')}>
            Start Practice
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={24} color="#10b981" />
          <h2 className="card-title">Practice complete</h2>
        </div>
        <p className="text-sm">Score: {result.score}/{result.total}</p>
        {result.xpEarned > 0 && <p className="text-sm">+{result.xpEarned} XP earned</p>}
        <div className="flex gap-2 mt-3">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setResult(null); setPhase('play') }}>Retry</button>
          <Link to="/practice" className="btn btn-primary btn-sm">All practices</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="practice-shell">
      <Link to="/practice" className="text-sm" style={{ color: 'var(--cq-primary)' }}>← All Practices</Link>
      <div className="card mt-3">
        <h2 className="card-title mb-3">{activity.title}</h2>
        {typeof children === 'function'
          ? children({ onComplete: handleComplete })
          : children}
      </div>
    </div>
  )
}
