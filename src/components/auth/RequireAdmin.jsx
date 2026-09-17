import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequireAdmin({ children }) {
  const { ready, isLoggedIn, isAdmin } = useAuth()
  if (!ready) return <div className="card">Loading…</div>
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '24px auto' }}>
        <h2 className="card-title">Admin access denied</h2>
        <p className="text-muted mt-2">This area is only for authorized administrators.</p>
        <Link to="/" className="btn btn-secondary mt-3">
          Back to app
        </Link>
      </div>
    )
  }
  return children
}
