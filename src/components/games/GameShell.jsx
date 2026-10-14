import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Star, ArrowRight } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

export default function GameShell({ game, children }) {
  const { recordGame, gamesPlayed } = useProgress()
  const [phase, setPhase] = useState('intro')
  const [result, setResult] = useState(null)

  const stats = gamesPlayed?.[game.id]

  function handleFinish(score) {
    const first = !(stats && stats.plays > 0)
    const xpEarned = first ? game.xpReward || 25 : 0
    recordGame(game.id, score, xpEarned)
    setResult({ score, xpEarned })
    setPhase('result')
  }

  if (phase === 'intro') {
    return (
      <div>
        <Link to="/games" className="back-link">
          ← All Games
        </Link>
        <div className="card">
          <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-warning">+{game.xpReward || 25} XP</span>
            {stats?.plays > 0 && <span className="badge badge-success">Played</span>}
          </div>
          <h2>{game.title}</h2>
          <p className="text-muted mb-3">{game.description}</p>
          <p className="text-sm mb-4">{game.instructions || 'Play the game and try to beat your best score.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => setPhase('play')}>
            Play Game →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div>
        <Link to="/games" className="back-link">
          ← All Games
        </Link>
        <div className="card" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h2>Game Complete!</h2>
          <p className="mt-2">
            Score: <strong>{result.score}</strong>
          </p>
          {result.xpEarned > 0 ? (
            <p className="mt-2" style={{ color: '#047857', fontWeight: 600 }}>
              <Star size={16} style={{ verticalAlign: 'middle' }} /> +{result.xpEarned} XP earned
            </p>
          ) : (
            <p className="text-sm text-muted mt-2">Already played — no extra first-play XP.</p>
          )}
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setResult(null); setPhase('play') }}>
              Play again
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
    <div>
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
