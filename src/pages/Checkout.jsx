import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'
import * as authStore from '../services/authStore'
import RequireAuth from '../components/auth/RequireAuth'

function CheckoutInner() {
  const { user, hasAccess, refreshUser, accessDaysLeft } = useAuth()
  const [searchParams] = useSearchParams()
  const planFromUrl = searchParams.get('plan') || ''

  const [course, setCourse] = useState(() => getCourseConfig())
  const [selectedPlanId, setSelectedPlanId] = useState(planFromUrl || null)
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetchCourseConfig()
      if (!cancelled && res.config) {
        setCourse(res.config)
        const active = (res.config.plans || []).filter((p) => p.active !== false)
        if (planFromUrl && active.some((p) => p.id === planFromUrl)) {
          setSelectedPlanId(planFromUrl)
        } else if (active.length) {
          setSelectedPlanId((prev) => prev || active[active.length - 1]?.id || active[0].id)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [planFromUrl])

  const plans = (course.plans || []).filter((p) => p.active !== false)
  const selected = plans.find((p) => p.id === selectedPlanId) || plans[0] || null

  const displayPrice =
    order?.amountPaise != null
      ? Math.round(Number(order.amountPaise) / 100)
      : order?.amountInr != null
        ? Number(order.amountInr)
        : selected?.price != null
          ? selected.price
          : course.price

  async function startOrder() {
    if (!selected) {
      setMessage('Please select a plan first.')
      return
    }
    setBusy(true)
    const res = await authStore.serverCreateOrder(selected.id)
    setBusy(false)
    if (!res.ok) {
      setMessage(res.error || 'Could not create order')
      return
    }
    setOrder(res.order)
    setStatus('pending')
    const inr =
      res.order?.amountPaise != null
        ? Math.round(Number(res.order.amountPaise) / 100)
        : res.order?.amountInr
    setMessage(
      `Order created for ${res.order?.planName || selected.name}: ${formatPrice(inr)} · ${res.order?.durationDays || selected.durationDays} days access. Access is granted only after server payment verification.`
    )
  }

  async function pay(outcome) {
    if (!order) return
    setBusy(true)
    const res = await authStore.serverConfirmPayment(order.id, outcome)
    setBusy(false)
    if (!res.ok && res.status !== 'failed' && res.status !== 'cancelled') {
      setMessage(res.error || 'Verification failed')
      setStatus(res.status || 'failed')
      return
    }
    if (res.ok && (res.status === 'paid' || res.alreadyPaid)) {
      setStatus('paid')
      setMessage('Payment verified by server. Access activated from enrollment date.')
      await refreshUser()
      return
    }
    setStatus(res.status || 'failed')
    setMessage(res.error || 'Payment not successful. No access granted.')
  }

  if (hasAccess && status !== 'paid') {
    return (
      <div className="card" style={{ maxWidth: 560, margin: '24px auto' }}>
        <h2 className="card-title">Checkout</h2>
        <p className="mt-2">
          You already have active <strong>{course.name || 'Computer Quest'}</strong> access.
        </p>
        {accessDaysLeft != null && (
          <p className="text-sm text-muted">{accessDaysLeft} days remaining</p>
        )}
        {user?.membership?.planId && (
          <p className="text-sm text-muted">Plan: {user.membership.planId}</p>
        )}
        <Link to="/" className="btn btn-primary mt-3">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '24px auto' }}>
      <h2 className="card-title">Checkout</h2>
      <p className="text-sm text-muted mt-1">
        Signed in as {user?.name} ({user?.email})
      </p>

      {plans.length > 0 && status === 'idle' && (
        <div className="mt-3">
          <p className="text-sm font-semibold mb-2">Select plan</p>
          {plans.map((p) => (
            <label
              key={p.id}
              className="flex gap-2 mb-2"
              style={{
                alignItems: 'flex-start',
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${selected?.id === p.id ? 'var(--cq-primary)' : 'var(--cq-border)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="plan"
                checked={selected?.id === p.id}
                onChange={() => setSelectedPlanId(p.id)}
              />
              <span>
                <strong>{p.name}</strong>
                <span className="text-sm text-muted">
                  {' '}
                  — {formatPrice(p.price)} · {p.durationDays} days
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      <p className="mt-3">
        <strong>{selected?.name || course.name || 'Computer Quest'}</strong>
        {selected ? ` — ${selected.durationDays} days access` : ''}
      </p>
      <p className="text-sm">
        Price: <strong>{formatPrice(displayPrice)}</strong>
        <span className="text-muted"> (admin plan price · charged by server)</span>
      </p>
      <p className="text-sm text-muted mt-2">
        Payments are verified on the server. Client-side “success” alone never unlocks the course.
        Provider adapter: <strong>mock</strong> (same server plan price will be used for
        Stripe/Razorpay later).
      </p>

      {status === 'idle' && (
        <button type="button" className="btn btn-primary mt-3" disabled={busy || !selected} onClick={startOrder}>
          Create order
        </button>
      )}

      {status === 'pending' && order && (
        <div className="mt-3">
          <p className="text-sm">
            Order ID: <code>{order.id}</code> · Amount:{' '}
            <strong>
              {formatPrice(
                order.amountPaise != null ? Math.round(Number(order.amountPaise) / 100) : order.amountInr
              )}
            </strong>
            {order.planName ? ` · ${order.planName}` : ''}
          </p>
          <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => pay('success')}>
              Mock pay — success
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => pay('fail')}>
              Mock pay — fail
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => pay('cancelled')}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'paid' && (
        <div className="mt-3">
          <p className="text-sm" style={{ color: '#047857' }}>
            {message || 'Access activated.'}
          </p>
          <Link to="/" className="btn btn-primary mt-3">
            Go to Dashboard
          </Link>
        </div>
      )}

      {message && status !== 'paid' && <p className="text-sm mt-3 text-muted">{message}</p>}

      <p className="text-sm mt-4">
        <Link to="/course">← Back to course plans</Link>
      </p>
    </div>
  )
}

export default function Checkout() {
  return (
    <RequireAuth>
      <CheckoutInner />
    </RequireAuth>
  )
}
