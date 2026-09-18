import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'
import * as authStore from '../services/authStore'
import RequireAuth from '../components/auth/RequireAuth'

function CheckoutInner() {
  const { user, hasAccess, refreshUser, accessDaysLeft } = useAuth()
  const [course, setCourse] = useState(() => getCourseConfig())
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetchCourseConfig()
      if (!cancelled && res.config) setCourse(res.config)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayPrice =
    order?.amountPaise != null
      ? Math.round(Number(order.amountPaise) / 100)
      : order?.amountInr != null
        ? Number(order.amountInr)
        : course.price

  async function startOrder() {
    setBusy(true)
    const res = await authStore.serverCreateOrder()
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
      `Order created on server for ${formatPrice(inr)}. Access is granted only after server payment verification.`
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
      <p className="mt-3">
        <strong>{course.name || 'Computer Quest'}</strong> — {course.durationYears || 2}-year access
      </p>
      <p className="text-sm">
        Price: <strong>{formatPrice(displayPrice)}</strong>
        <span className="text-muted"> (set by admin · charged by server)</span>
      </p>
      <p className="text-sm text-muted mt-2">
        Payments are verified on the server. Client-side “success” alone never unlocks the course.
        Provider adapter: <strong>mock</strong> (same server price will be used for Stripe/Razorpay later).
      </p>

      {status === 'idle' && (
        <button type="button" className="btn btn-primary mt-3" disabled={busy} onClick={startOrder}>
          Create order
        </button>
      )}

      {status === 'pending' && order && (
        <div className="mt-3">
          <p className="text-sm">
            Order ID: <code>{order.id}</code> · Amount:{' '}
            <strong>
              {formatPrice(
                order.amountPaise != null ? Math.round(Number(order.amountPaise) / 100) : displayPrice
              )}
            </strong>
          </p>
          <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => pay('success')}>
              Mock pay success
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => pay('failed')}>
              Mock pay fail
            </button>
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => pay('cancelled')}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'paid' && (
        <div className="mt-3">
          <p className="badge badge-success">Access granted</p>
          <Link to="/" className="btn btn-primary mt-3">
            Start learning
          </Link>
        </div>
      )}

      {message && <p className="text-sm mt-3">{message}</p>}
      <Link to="/course" className="btn btn-secondary btn-sm mt-3">
        ← Course page
      </Link>
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
