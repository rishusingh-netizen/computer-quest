import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/curriculum', label: 'Curriculum' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/certificates', label: 'Certificates' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <div className="admin-brand">
          <strong>CQ Admin</strong>
          <span className="text-sm text-muted">{user?.name}</span>
        </div>
        <nav>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" className="btn btn-secondary btn-sm">
            Student app
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
