import { NavLink } from 'react-router-dom'
import { useProgress } from '../../context/ProgressContext'
import { useAuth } from '../../context/AuthContext'
import { Icons } from '../ui/Icons'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/learn', label: 'Learn', icon: 'book' },
  { to: '/practice', label: 'Practice Lab', icon: 'flask' },
  { to: '/games', label: 'Game Zone', icon: 'game' },
  { to: '/tests', label: 'Tests', icon: 'clipboard' },
  { to: '/revision', label: 'Revision', icon: 'refresh' },
  { to: '/ai-tutor', label: 'AI Tutor', icon: 'sparkles' },
  { to: '/progress', label: 'Progress', icon: 'chart' },
]

export default function Sidebar({ open, onClose }) {
  const { xp, level, streak } = useProgress()
  const { user } = useAuth()

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo">CQ</div>
          <div>
            <h1>Computer Quest</h1>
            <span>Learn by doing</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icons name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="xp-mini">
            <strong>Lv {level}</strong>
            <span>· {xp} XP</span>
            {streak > 0 && <span>· 🔥 {streak}</span>}
          </div>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-item" style={{ marginTop: 8 }} onClick={onClose}>
              <Icons name="settings" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
