import { Menu, Flame } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

function getTitle(pathname) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/learn')) return 'Learn'
  if (pathname.startsWith('/practice')) return 'Practice Lab'
  if (pathname.startsWith('/games')) return 'Game Zone'
  if (pathname.startsWith('/tests')) return 'Tests'
  if (pathname.startsWith('/revision')) return 'Revision'
  if (pathname.startsWith('/ai-tutor')) return 'AI Tutor'
  if (pathname.startsWith('/progress')) return 'Progress'
  return 'Computer Quest'
}

export default function Topbar({ pathname, onMenuClick }) {
  const { streak, xp, level } = useProgress()
  const title = getTitle(pathname)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-right">
        {streak > 0 && (
          <div className="streak-badge">
            <Flame size={14} />
            {streak} day streak
          </div>
        )}
        <div className="text-sm text-muted" style={{ fontWeight: 600 }}>
          Level {level} · {xp} XP
        </div>
      </div>
    </header>
  )
}
