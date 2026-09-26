import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice, PAYMENT_CONFIG, daysRemaining as calcDays } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'

export default function Course() {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(() => getCourseConfig())
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetchCourseConfig()
      if (!cancelled && res.config) {
        setCourse(res.config)
        const active = (res.config.plans || []).filter((p) => p.active !== false)
        if (active.length) {
          setSelectedPlanId((prev) => prev || active[active.length - 1]?.id || active[0].id)
        }
      }
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

  const plans = (course.plans || []).filter((p) => p.active !== false)
  const selected = plans.find((p) => p.id === selectedPlanId) || plans[0] || null

  function enroll() {
    if (!selected) return
    const q = encodeURIComponent(selected.id)
    if (!isLoggedIn) {
      navigate(`/signup?plan=${q}`)
      return
    }
    navigate(`/checkout?plan=${q}`)
  }

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

      <h3 className="card-title mb-3">Choose your plan</h3>
      {loading ? (
        <p className="text-sm text-muted mb-4">Loading plans…</p>
      ) : plans.length === 0 ? (
        <div className="card mb-4">
          <p className="text-sm text-muted">
            Plans are being configured by the course owner. Please check back soon.
          </p>
        </div>
      ) : (
        <div className="grid-3 mb-4" style={{ gap: 16 }}>
          {plans.map((plan) => {
            const isSelected = selected?.id === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className="card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--cq-primary)' : undefined,
                  boxShadow: isSelected ? '0 0 0 2px rgba(79, 70, 229, 0.25)' : undefined,
                  width: '100%',
                }}
              >
                <p className="font-semibold">{plan.name}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 4px' }}>
                  {formatPrice(plan.price)}
                </p>
                <p className="text-sm text-muted mb-2">
                  {plan.durationDays} days access
                  {plan.durationDays >= 360 ? ` (≈ ${Math.round(plan.durationDays / 365)} year)` : ''}
                </p>
                {plan.description && <p className="text-sm text-muted mb-2">{plan.description}</p>}
                <ul className="text-sm" style={{ paddingLeft: 18, margin: 0 }}>
                  {(plan.features || []).slice(0, 8).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {isSelected && (
                  <p className="text-sm mt-2" style={{ color: 'var(--cq-primary)', fontWeight: 600 }}>
                    Selected
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="card mb-4" style={{ borderColor: 'var(--cq-primary)' }}>
        <div className="flex justify-between items-start gap-3" style={{ flexWrap: 'wrap' }}>
          <div>
            {selected ? (
              <>
                <p className="text-sm text-muted">{selected.name}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
                  {loading ? '…' : formatPrice(selected.price)}
                </p>
                <p className="text-sm text-muted">
                  Access for {selected.durationDays} days from activation
                  {course.batchId ? ` · Batch: ${course.batchId}` : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Select a plan above to continue.</p>
            )}
            {PAYMENT_CONFIG.mode === 'mock' && (
              <p className="text-sm mt-2" style={{ color: '#b45309' }}>
                Payment is in <strong>MOCK mode</strong>. The amount charged (when you go live) is the
                admin-configured plan price from the server.
              </p>
            )}
          </div>
          <div>
            {hasAccess ? (
              <>
                <span className="badge badge-success">Active access</span>
                <p className="text-sm mt-2">{remaining} days remaining</p>
                {membership?.planId && (
                  <p className="text-sm text-muted">Plan: {membership.planId}</p>
                )}
                <Link to="/" className="btn btn-primary mt-2">
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selected}
                  onClick={enroll}
                >
                  {isLoggedIn ? 'Proceed to checkout' : 'Sign up to enroll'}
                </button>
                {!isLoggedIn && (
                  <Link
                    to={selected ? `/login?plan=${encodeURIComponent(selected.id)}` : '/login'}
                    className="btn btn-secondary"
                    style={{ marginLeft: 8 }}
                  >
                    Log in
                  </Link>
                )}
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
