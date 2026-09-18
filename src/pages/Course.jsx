import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, PAYMENT_CONFIG, daysRemaining as calcDays } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'

export default function Course() {
  const { isLoggedIn, user } = useAuth()
  const [course, setCourse] = useState(() => getCourseConfig())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetchCourseConfig()
      if (!cancelled && res.config) setCourse(res.config)
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const membership = user?.membership
  const hasAccess = membership?.status === 'active'
  const remaining = membership?.expiresAt
    ? calcDays(membership.expiresAt)
    : membership?.accessExpiryDate
      ? calcDays(membership.accessExpiryDate)
      : 0

  return (
    <div>
      <div className="card mb-4">
        <h2 className="card-title">{course.name}</h2>
        <p>{course.tagline}</p>
        <p className="text-sm mt-2 text-muted">{course.description}</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="card-title mb-3">What you get</h3>
          <ul className="text-sm" style={{ paddingLeft: 18 }}>
            {(course.includes || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="card-title mb-3">Modules</h3>
          {(course.modules || []).map((m) => (
            <div key={m.name} className="mb-2">
              <strong>{m.name}</strong>
              <p className="text-sm text-muted">{m.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4" style={{ borderColor: 'var(--cq-primary)' }}>
        <div className="flex justify-between items-start gap-3" style={{ flexWrap: 'wrap' }}>
          <div>
            <p className="text-sm text-muted">{course.durationYears || 2}-year membership</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
              {loading ? '…' : formatPrice(course.price)}
            </p>
            <p className="text-sm text-muted">
              Access for {course.durationYears || 2} years from activation
              {course.batchId ? ` · Batch: ${course.batchId}` : ''}
            </p>
            {PAYMENT_CONFIG.mode === 'mock' && (
              <p className="text-sm mt-2" style={{ color: '#b45309' }}>
                Payment is in <strong>MOCK mode</strong>. The amount charged (when you go live) is the
                admin-configured price from the server.
              </p>
            )}
          </div>
          <div>
            {hasAccess ? (
              <>
                <span className="badge badge-success">Active access</span>
                <p className="text-sm mt-2">{remaining} days remaining</p>
                <Link to="/" className="btn btn-primary mt-2">
                  Go to Dashboard
                </Link>
              </>
            ) : isLoggedIn ? (
              <Link to="/checkout" className="btn btn-primary">
                Proceed to checkout
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  Sign up to enroll
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ marginLeft: 8 }}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
        {(membership?.expiresAt || membership?.accessExpiryDate) && (
          <p className="text-sm text-muted mt-3">
            Membership status: {membership.status} · Expires{' '}
            {new Date(membership.expiresAt || membership.accessExpiryDate).toLocaleDateString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}
