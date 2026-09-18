import { useParams, Link } from 'react-router-dom'
import { Gamepad2 } from '../components/ui/Icons'
import { GAMES, getGameById } from '../data/games'
import { useProgress } from '../context/ProgressContext'
import GameShell from '../components/games/GameShell'
import TypingRace from '../components/games/TypingRace'
import ShortcutRace from '../components/games/ShortcutRace'
import FolderSort from '../components/games/FolderSort'
import HardwareMatch from '../components/games/HardwareMatch'
import PhishingSpotter from '../components/games/PhishingSpotter'

const GAME_MAP = {
  'typing-race': TypingRace,
  'shortcut-race': ShortcutRace,
  'folder-sort': FolderSort,
  'hardware-match': HardwareMatch,
  'phishing-spotter': PhishingSpotter,
}

export default function GameZone() {
  const { gameId } = useParams()
  const { gamesPlayed, recordGame } = useProgress()

  if (gameId) {
    const game = getGameById(gameId)
    const Comp = GAME_MAP[gameId]
    if (!game || !Comp) {
      return (
        <div className="card">
          <p>Game not found.</p>
          <Link to="/games" className="btn btn-secondary mt-3">All games</Link>
        </div>
      )
    }
    return (
      <GameShell
        game={game}
        onFinish={(score, best) => recordGame(gameId, score, best, game.xpReward)}
      >
        <Comp game={game} />
      </GameShell>
    )
  }

  return (
    <div>
      <p className="text-muted mb-4 text-sm">
        Play short skill games to reinforce lessons. Earn XP on first play and when you beat your best.
      </p>
      <div className="grid-2">
        {GAMES.map((g) => {
          const stats = gamesPlayed?.[g.id]
          return (
            <Link key={g.id} to={`/games/${g.id}`} className="card practice-card">
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
                  }}
                >
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{g.title}</h3>
                  <span className="badge badge-warning">+{g.xpReward} XP</span>
                  {g.difficulty && <span className="badge badge-primary" style={{ marginLeft: 6 }}>{g.difficulty}</span>}
                </div>
              </div>
              <p className="text-sm text-muted">{g.description}</p>
              {stats && (
                <p className="text-sm mt-2">Best: {stats.bestScore} · Plays: {stats.plays}</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
