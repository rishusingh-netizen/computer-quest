import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen } from '../ui/Icons'

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
      <div className="access-required">
        <div className="card access-required-card">
          <div className="access-required-icon" aria-hidden="true">
            <BookOpen size={28} />
          </div>
          <h2 className="card-title">
            {expired ? 'Access expired' : 'Course Access Required'}
          </h2>
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
          <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/course" className="btn btn-primary">
              {expired ? 'Renew access' : 'View Course & Enroll'}
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
