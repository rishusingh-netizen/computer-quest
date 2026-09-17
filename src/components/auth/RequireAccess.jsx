import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Protects paid learning routes.
 * Unauthenticated → login; authenticated without active membership → course/paywall.
 */
export default function RequireAccess({ children }) {
  const { ready, isLoggedIn, hasAccess, membership } = useAuth()
  const location = useLocation()

  if (!ready) return <div className="card">Loading…</div>

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasAccess) {
    const expired = membership?.status === 'expired'
    return (
      <div className="card" style={{ maxWidth: 520, margin: '24px auto' }}>
        <h2 className="card-title">{expired ? 'Access expired' : 'Course access required'}</h2>
        <p className="text-muted mt-2">
          {expired
            ? 'Your 2-year Computer Quest access has ended. Your progress is saved. Renew to continue learning.'
            : 'Enroll in Computer Quest to unlock lessons, Practice Lab, games, tests, revision and Quest Helper.'}
        </p>
        {membership?.accessExpiryDate && (
          <p className="text-sm mt-2">
            Previous expiry: {new Date(membership.accessExpiryDate).toLocaleDateString('en-IN')}
          </p>
        )}
        <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
          <Link to="/course" className="btn btn-primary">
            {expired ? 'Renew access' : 'View course & enroll'}
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            Profile
          </Link>
        </div>
      </div>
    )
  }

  return children
}
