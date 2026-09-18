import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { COURSE, formatPrice } from '../config/course'
import RequireAuth from '../components/auth/RequireAuth'
import { api } from '../services/api'
import { evaluateCompletion } from '../services/completion'
import { useProgress } from '../context/ProgressContext'

function ProfileInner() {
  const { user, hasAccess, accessDaysLeft, logout } = useAuth()
  const progress = useProgress()
  const completion = evaluateCompletion(progress)
  const [certificate, setCertificate] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await api.myCertificate()
      if (!cancelled && res.ok) setCertificate(res.certificate || null)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const membership = user?.membership

  return (
    <div>
      <div className="card mb-4">
        <h2 className="card-title">Profile</h2>
        <p className="mt-2">
          <strong>{user.name}</strong>
        </p>
        <p className="text-sm text-muted">{user.email}</p>
        <p className="text-sm text-muted">
          Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
        </p>
        <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-2">{COURSE.name} Access</h3>
        {membership ? (
          <>
            <p>
              Status:{' '}
              <span className={`badge ${hasAccess ? 'badge-success' : 'badge-warning'}`}>
                {hasAccess ? 'Active' : membership.status || 'Inactive'}
              </span>
            </p>
            {membership.startAt && (
              <p className="text-sm">
                Started: {new Date(membership.startAt).toLocaleDateString('en-IN')}
              </p>
            )}
            {membership.expiresAt && (
              <p className="text-sm">
                Expires: {new Date(membership.expiresAt).toLocaleDateString('en-IN')}
                {accessDaysLeft != null && hasAccess ? ` (${accessDaysLeft} days left)` : ''}
              </p>
            )}
            <p className="text-sm text-muted mt-1">Source: {membership.source || '—'}</p>
          </>
        ) : (
          <p className="text-sm">No membership yet.</p>
        )}
        {!hasAccess && (
          <Link to="/checkout" className="btn btn-primary btn-sm mt-3">
            Enroll / Checkout
          </Link>
        )}
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-2">Course progress</h3>
        <p className="text-sm">Completion: {completion.percent}%</p>
        <p className="text-sm">
          Certificate eligible: {completion.eligible ? 'Yes' : 'Not yet'}
        </p>
        {certificate ? (
          <p className="text-sm mt-2">
            Certificate ID: <code>{certificate.id}</code>{' '}
            <Link to={`/certificate/${certificate.id}`}>View</Link>
          </p>
        ) : (
          <Link to="/completion" className="btn btn-secondary btn-sm mt-2">
            Completion status
          </Link>
        )}
      </div>

      <div className="card">
        <h3 className="card-title mb-2">Account security</h3>
        <p className="text-sm text-muted">
          Authentication, membership, payments and certificates are stored on the server. Progress
          syncs when you are signed in. Price: {formatPrice(COURSE.price)}.
        </p>
      </div>
    </div>
  )
}

export default function Profile() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  )
}
