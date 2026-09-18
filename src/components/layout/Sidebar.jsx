import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Gamepad2,
  ClipboardList,
  RefreshCw,
  Bot,
  BarChart3,
  Trophy,
  Zap,
} from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice Lab', icon: FlaskConical },
  { to: '/games', label: 'Game Zone', icon: Gamepad2 },
  { to: '/tests', label: 'Tests', icon: ClipboardList },
  { to: '/revision', label: 'Revision', icon: RefreshCw },
  { to: '/ai-tutor', label: 'AI Tutor', icon: Bot },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/completion', label: 'Completion', icon: Trophy },
]

const PUBLIC_NAV = [
  { to: '/course', label: 'Course' },
  { to: '/profile', label: 'Profile' },
  { to: '/verify', label: 'Verify cert' },
]

export default function Sidebar({ open, onClose }) {
  const { xp, streak } = useProgress()
  const { isLoggedIn, hasAccess, accessDaysLeft, logout, user, isAdmin } = useAuth()

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo">CQ</div>
          <div>
            <h1>Computer Quest</h1>
            <span>Learn · Practice · Master</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          <div style={{ margin: '12px 0', borderTop: '1px solid var(--cq-border)' }} />
          {PUBLIC_NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span>{label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="nav-item" onClick={onClose}>
              <span>Admin</span>
            </NavLink>
          )}
          {!isLoggedIn && (
            <NavLink to="/login" className="nav-item" onClick={onClose}>
              <span>Log in</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {isLoggedIn && (
            <div className="text-sm mb-2" style={{ padding: '0 4px' }}>
              {user?.name}
              {hasAccess ? (
                <div className="text-muted">{accessDaysLeft != null ? accessDaysLeft : '—'}d left</div>
              ) : (
                <div className="text-muted">No active access</div>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { logout(); onClose() }}>
                Log out
              </button>
            </div>
          )}
          <div className="xp-mini">
            <Zap size={16} color="#4f46e5" />
            <span>
              <strong>{xp}</strong> XP
            </span>
            {streak > 0 && (
              <span style={{ marginLeft: 8 }}>
                · 🔥 {streak} day{streak !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
