import { useParams, Link } from 'react-router-dom'
import {
  Gamepad2,
  Monitor,
  Keyboard,
  FolderTree,
  Type,
  ShieldAlert,
} from '../components/ui/Icons'
import { GAMES, getGameById } from '../data/games'
import { useProgress } from '../context/ProgressContext'
import GameShell from '../components/games/GameShell'
import ShortcutRace from '../components/games/ShortcutRace'
import HardwareMatch from '../components/games/HardwareMatch'
import TypingRace from '../components/games/TypingRace'
import FolderSort from '../components/games/FolderSort'
import PhishingSpotter from '../components/games/PhishingSpotter'

const COMPONENTS = {
  'shortcut-race': ShortcutRace,
  'hardware-match': HardwareMatch,
  'typing-race': TypingRace,
  'folder-sort': FolderSort,
  'phishing-spotter': PhishingSpotter,
}

const ICONS = {
  'shortcut-race': Keyboard,
  'hardware-match': Monitor,
  'typing-race': Type,
  'folder-sort': FolderTree,
  'phishing-spotter': ShieldAlert,
}

function GameView({ gameId }) {
  const game = getGameById(gameId)
  if (!game) {
    return (
      <div className="card">
        <p>Game not found.</p>
        <Link to="/games" className="btn btn-secondary mt-3">
          ← Back to Game Zone
        </Link>
      </div>
    )
  }
  const Component = COMPONENTS[game.id]
  if (!Component) {
    return (
      <div className="card">
        <p>Game component missing.</p>
        <Link to="/games" className="btn btn-secondary mt-3">
          ← Back
        </Link>
      </div>
    )
  }
  return (
    <GameShell game={game}>
      {({ onFinish }) => <Component onFinish={onFinish} />}
    </GameShell>
  )
}

export default function GameZone() {
  const { gameId } = useParams()
  const { gamesPlayed } = useProgress()

  if (gameId) {
    return <GameView gameId={gameId} />
  }

  const playedCount = GAMES.filter((g) => gamesPlayed?.[g.id]?.plays > 0).length

  return (
    <div>
      <p className="text-muted mb-4 text-sm">
        Fun educational games that reinforce what you learn. Score points, improve your best score and
        earn XP.
      </p>

      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 className="font-semibold">Game Zone Progress</h3>
            <p className="text-sm text-muted">
              {playedCount} of {GAMES.length} games played
            </p>
          </div>
          <div className="badge badge-primary">{playedCount}/{GAMES.length}</div>
        </div>
      </div>

      <div className="grid-2">
        {GAMES.map((g) => {
          const stats = gamesPlayed?.[g.id]
          const Icon = ICONS[g.id] || Gamepad2
          return (
            <div key={g.id} className="card practice-card">
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#fce7f3',
                    color: '#be185d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold">{g.title}</h3>
                  <div className="flex gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                    <span
                      className={`badge ${
                        g.difficulty === 'Easy'
                          ? 'badge-success'
                          : g.difficulty === 'Medium'
                            ? 'badge-warning'
                            : 'badge-danger'
                      }`}
                    >
                      {g.difficulty}
                    </span>
                    <span className="badge badge-warning">+{g.xpReward} XP</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted mb-3">{g.description}</p>
              {stats && stats.plays > 0 && (
                <p className="text-sm text-muted mb-2">
                  Best: {stats.bestScore} · Plays: {stats.plays}
                </p>
              )}
              <Link to={`/games/${g.id}`} className="btn btn-primary btn-sm">
                {stats?.plays > 0 ? 'Play again' : 'Play'}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
