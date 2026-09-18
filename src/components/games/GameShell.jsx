import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Star, ArrowRight } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

/**
 * Shared shell for Game Zone: intro → play → result
 * children({ onFinish }) where onFinish(score, meta?) is called by the game
 * score is a number (higher is better). XP awarded via recordGame.
 */
export default function GameShell({ game, children }) {
  const { recordGame, gamesPlayed } = useProgress()
  const [phase, setPhase] = useState('intro')
  const [result, setResult] = useState(null)

  const stats = gamesPlayed?.[game.id]

  function handleFinish(score, meta = {}) {
    recordGame(game.id, score, score, game.xpReward)
    // Read lastXp after dispatch is tricky; estimate for UI
    const isFirst = !stats || stats.plays === 0
    const beatBest = stats && score > (stats.bestScore || 0)
    let xpEarned = 0
    if (isFirst) xpEarned = game.xpReward
    else if (beatBest) xpEarned = Math.max(5, Math.floor(game.xpReward / 4))
    setResult({ score, xpEarned, meta })
    setPhase('result')
  }

  function handleRetry() {
    setResult(null)
    setPhase('play')
  }

  if (phase === 'intro') {
    return (
      <div className="practice-shell">
        <Link to="/games" className="back-link">
          ← All Games
        </Link>
        <div className="card practice-intro">
          <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <span
              className={`badge ${
                game.difficulty === 'Easy'
                  ? 'badge-success'
                  : game.difficulty === 'Medium'
                    ? 'badge-warning'
                    : 'badge-danger'
              }`}
            >
              {game.difficulty}
            </span>
            <span className="badge badge-warning">+{game.xpReward} XP</span>
            <span className="badge badge-primary">~{game.estimatedMin} min</span>
            {stats && stats.plays > 0 && (
              <span className="badge badge-success">
                Best: {stats.bestScore} · Plays: {stats.plays}
              </span>
            )}
          </div>
          <h2 className="practice-title">{game.title}</h2>
          <p className="text-muted mb-3">{game.description}</p>
          <h3 className="card-title mb-2">How to play</h3>
          <p className="text-sm mb-4">{game.instructions}</p>
          {game.learnPoints?.length > 0 && (
            <>
              <h3 className="card-title mb-2">Skills reinforced</h3>
              <ul className="key-points mb-4">
                {game.learnPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setPhase('play')}>
            Play Game →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="practice-shell">
        <Link to="/games" className="back-link">
          ← All Games
        </Link>
        <div className="card practice-result" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h2 className="practice-title">Game Over!</h2>
          <p className="mt-2" style={{ fontSize: '1.25rem' }}>
            Score: <strong>{result.score}</strong>
          </p>
          {result.meta?.detail && (
            <p className="text-sm text-muted mt-2">{result.meta.detail}</p>
          )}
          {result.xpEarned > 0 ? (
            <p className="mt-2" style={{ color: '#047857', fontWeight: 600 }}>
              <Star size={16} style={{ verticalAlign: 'middle' }} /> +{result.xpEarned} XP
            </p>
          ) : (
            <p className="text-sm text-muted mt-2">No new XP — try to beat your best score!</p>
          )}
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleRetry}>
              Play Again
            </button>
            <Link to="/games" className="btn btn-primary">
              More Games <ArrowRight size={16} />
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
        <span className="badge badge-primary">{game.title}</span>
      </div>
      {typeof children === 'function' ? children({ onFinish: handleFinish }) : children}
    </div>
  )
}
