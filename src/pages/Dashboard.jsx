import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { LEVELS } from '../data/levels'
import { GAMES } from '../data/games'
import {
  BookOpen,
  FlaskConical,
  Gamepad2,
  ClipboardList,
  RefreshCw,
  Bot,
  Trophy,
  Zap,
  ChevronRight,
} from '../components/ui/Icons'

export default function Dashboard() {
  const {
    xp,
    level,
    streak,
    completedLessons,
    practiceCompleted,
    progressPercent,
    lessonsCompletedCount,
    totalLessons,
  } = useProgress()
  const { user, hasAccess } = useAuth()

  const nextLevel = LEVELS.find((l) => !completedLessons.some((id) => id.startsWith(`L${l.id}-`))) || LEVELS[0]
  const recentGames = GAMES.slice(0, 3)

  return (
    <div>
      <div className="card welcome-card mb-4">
        <h2>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</h2>
        <p>Continue your Computer Quest journey. Learn, practice, and master computer skills.</p>
        <div className="flex gap-3 mt-3" style={{ flexWrap: 'wrap' }}>
          <Link to="/learn" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
            Continue Learning
          </Link>
          <Link to="/practice" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>
            Practice Lab
          </Link>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Zap size={20} />
          </div>
          <div className="stat-value">{xp}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#047857' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-value">Lv {level}</div>
          <div className="stat-label">Your Level</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            🔥
          </div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <BookOpen size={20} />
          </div>
          <div className="stat-value">{progressPercent}%</div>
          <div className="stat-label">Course Progress</div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Course progress</h3>
            <Link to="/progress" className="text-sm" style={{ color: 'var(--cq-primary)' }}>
              Details <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          <p className="text-sm text-muted mb-2">
            {lessonsCompletedCount} of {totalLessons} lessons completed
          </p>
          <div className="progress-bar mb-3">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-sm">
            Practice completed: <strong>{practiceCompleted.length}</strong>
          </p>
          {!hasAccess && (
            <Link to="/checkout" className="btn btn-primary btn-sm mt-3">
              Unlock full course
            </Link>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Continue learning</h3>
          </div>
          {nextLevel && (
            <>
              <p className="font-semibold">{nextLevel.title}</p>
              <p className="text-sm text-muted mb-3">{nextLevel.description}</p>
              <Link to={`/learn`} className="btn btn-primary btn-sm">
                Open Learn
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-3">Quick links</h3>
        <div className="grid-3">
          <Link to="/learn" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <BookOpen size={20} /> <span>Learn</span>
          </Link>
          <Link to="/practice" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <FlaskConical size={20} /> <span>Practice Lab</span>
          </Link>
          <Link to="/games" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <Gamepad2 size={20} /> <span>Game Zone</span>
          </Link>
          <Link to="/tests" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <ClipboardList size={20} /> <span>Tests</span>
          </Link>
          <Link to="/revision" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <RefreshCw size={20} /> <span>Revision</span>
          </Link>
          <Link to="/ai-tutor" className="nav-item" style={{ border: '1px solid var(--cq-border)', borderRadius: 10 }}>
            <Bot size={20} /> <span>AI Tutor</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Featured games</h3>
          <Link to="/games" className="text-sm" style={{ color: 'var(--cq-primary)' }}>
            All games
          </Link>
        </div>
        <div className="grid-3">
          {recentGames.map((g) => (
            <Link key={g.id} to={`/games/${g.id}`} className="card" style={{ padding: 16 }}>
              <p className="font-semibold">{g.title}</p>
              <p className="text-sm text-muted">{g.description}</p>
              <span className="badge badge-primary mt-2">{g.xpReward} XP</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
