import { Link } from 'react-router-dom'
import { formatPrice, PAYMENT_CONFIG } from '../config/course'
import { getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'

export default function Course() {
  const { isLoggedIn, hasAccess, membership, daysRemaining } = useAuth()
  const COURSE = getCourseConfig()

  return (
    <div>
      <div className="card welcome-card mb-4">
        <h2>{COURSE.name}</h2>
        <p>{COURSE.tagline}</p>
        <p className="text-sm mt-2">{COURSE.description}</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="card-title mb-3">What you get</h3>
          <ul className="key-points">
            {COURSE.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="card-title mb-3">Modules</h3>
          {COURSE.modules.map((m) => (
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
            <p className="text-sm text-muted">2-year membership</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
              {formatPrice(COURSE.price)}
            </p>
            <p className="text-sm text-muted">
              Access for {COURSE.durationYears} years from activation · Batch: {COURSE.batchId}
            </p>
            {PAYMENT_CONFIG.mode === 'mock' && (
              <p className="text-sm mt-2" style={{ color: '#b45309' }}>
                Payment is in <strong>MOCK mode</strong> for development. Real payments need a secure
                server and provider keys.
              </p>
            )}
          </div>
          <div>
            {hasAccess ? (
              <>
                <span className="badge badge-success">Active access</span>
                <p className="text-sm mt-2">{daysRemaining} days remaining</p>
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
        {membership?.accessExpiryDate && (
          <p className="text-sm text-muted mt-3">
            Membership status: {membership.status} · Expires{' '}
            {new Date(membership.accessExpiryDate).toLocaleDateString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}
