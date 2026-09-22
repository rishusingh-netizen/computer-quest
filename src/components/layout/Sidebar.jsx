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

const GROUPS = [
  {
    label: 'Learn',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/learn', label: 'Learn', icon: BookOpen },
      { to: '/practice', label: 'Practice Lab', icon: FlaskConical },
      { to: '/games', label: 'Game Zone', icon: Gamepad2 },
      { to: '/tests', label: 'Tests', icon: ClipboardList },
      { to: '/revision', label: 'Revision', icon: RefreshCw },
    ],
  },
  {
    label: 'Support',
    items: [{ to: '/ai-tutor', label: 'AI Tutor', icon: Bot }],
  },
  {
    label: 'Progress',
    items: [
      { to: '/progress', label: 'Progress', icon: BarChart3 },
      { to: '/completion', label: 'Completion', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/course', label: 'Course' },
      { to: '/profile', label: 'Profile' },
      { to: '/verify', label: 'Verify cert' },
    ],
  },
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
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="logo" aria-hidden="true">
            CQ
          </div>
          <div>
            <h1>Computer Quest</h1>
            <span>Learn · Practice · Master</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {Icon ? <Icon size={20} aria-hidden="true" /> : null}
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {isAdmin && (
            <div className="nav-group">
              <div className="nav-group-label">Admin</div>
              <NavLink to="/admin" className="nav-item" onClick={onClose}>
                <span>Admin panel</span>
              </NavLink>
            </div>
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
              <div className="font-semibold">{user?.name}</div>
              {hasAccess ? (
                <div className="text-muted">
                  {accessDaysLeft != null ? accessDaysLeft : '—'}d access left
                </div>
              ) : (
                <div className="text-muted">No active access</div>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout()
                  onClose()
                }}
              >
                Log out
              </button>
            </div>
          )}
          <div className="xp-mini">
            <Zap size={16} color="#4f46e5" aria-hidden="true" />
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
