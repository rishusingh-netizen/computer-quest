import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'
import * as authStore from '../services/authStore'
import RequireAuth from '../components/auth/RequireAuth'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(window.Razorpay)
      return
    }
    const existing = document.querySelector('script[data-cq-razorpay]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay))
      existing.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.cqRazorpay = '1'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.body.appendChild(script)
  })
}

function CheckoutInner() {
  const { user, hasAccess, refreshUser, applySession, accessDaysLeft } = useAuth()
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
        if (planFromUrl && active.some((p) => p.id === planFromUrl)) setSelectedPlanId(planFromUrl)
        else if (active.length) setSelectedPlanId((prev) => prev || active[active.length - 1]?.id || active[0].id)
      }
    })()
    return () => { cancelled = true }
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

  async function openUpiCheckout(createdOrder) {
    const Razorpay = await loadRazorpayScript()
    if (!createdOrder?.keyId || !createdOrder?.razorpayOrderId) throw new Error('Payment provider order is incomplete')
    return new Promise((resolve) => {
      const rzp = new Razorpay({
        key: createdOrder.keyId,
        amount: createdOrder.amountPaise,
        currency: createdOrder.currency || 'INR',
        name: 'Computer Quest',
        description: createdOrder.planName || selected?.name || 'Course access',
        order_id: createdOrder.razorpayOrderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        notes: { local_order_id: createdOrder.id, plan_id: createdOrder.planId || selected?.id || '' },
        theme: { color: '#4f46e5' },
        handler: (response) => resolve({ type: 'success', response }),
        modal: { ondismiss: () => resolve({ type: 'dismiss' }) },
      })
      rzp.on('payment.failed', (resp) => resolve({ type: 'failed', response: resp }))
      rzp.open()
    })
  }

  async function startPayment() {
    if (!selected) { setMessage('Please select a plan first.'); return }
    if (busy) return
    setBusy(true); setMessage(''); setStatus('processing')
    const res = await authStore.serverCreateOrder(selected.id)
    if (!res.ok) { setBusy(false); setStatus('failed'); setMessage(res.error || 'Could not create payment order'); return }
    setOrder(res.order); setStatus('pending')
    try {
      const outcome = await openUpiCheckout(res.order)
      if (outcome.type === 'dismiss') {
        await authStore.serverConfirmPayment(res.order.id, { cancelled: true })
        setStatus('cancelled'); setMessage('Payment cancelled. You can try again when ready.'); setBusy(false); return
      }
      if (outcome.type === 'failed') {
        await authStore.serverConfirmPayment(res.order.id, { failed: true })
        setStatus('failed')
        setMessage(outcome.response?.error?.description || 'Payment failed. No membership was activated. You can retry.')
        setBusy(false); return
      }
      setMessage('Verifying payment with the server…')
      const confirm = await authStore.serverConfirmPayment(res.order.id, {
        razorpay_order_id: outcome.response.razorpay_order_id,
        razorpay_payment_id: outcome.response.razorpay_payment_id,
        razorpay_signature: outcome.response.razorpay_signature,
      })
      if (!confirm.ok) {
        setStatus('failed'); setMessage(confirm.error || 'Payment could not be verified. Membership was not activated.'); setBusy(false); return
      }
      if (confirm.token || confirm.user) applySession(confirm.user, confirm.token)
      await refreshUser?.()
      setStatus('paid'); setMessage('Payment verified. Your course access is active.')
    } catch (e) {
      setStatus('failed'); setMessage(e.message || 'Payment could not be started')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <h1 className="page-title">Checkout</h1>
      {hasAccess && (
        <p className="text-sm mb-3" style={{ color: '#047857' }}>
          You already have active access{accessDaysLeft != null ? ` (${accessDaysLeft} days left)` : ''}.
        </p>
      )}
      {plans.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted mb-2">Select a plan</p>
          <div className="grid-2">
            {plans.map((p) => (
              <button key={p.id} type="button" className="card" style={{ textAlign: 'left', border: selectedPlanId === p.id ? '2px solid #4f46e5' : '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => { if (busy) return; setSelectedPlanId(p.id); setOrder(null); setStatus('idle'); setMessage('') }}>
                <strong>{p.name}</strong>
                <p className="text-sm text-muted mb-1">{p.durationDays} days access</p>
                <p><strong>{formatPrice(p.price)}</strong></p>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3"><strong>{selected?.name || 'Computer Quest'}</strong>{selected ? ` — ${selected.durationDays} days access` : ''}</p>
      <p className="text-sm">Price: <strong>{formatPrice(displayPrice)}</strong></p>
      <p className="text-sm text-muted mt-2">Pay with <strong>UPI</strong> via Razorpay. Membership activates only after server verification.</p>
      {(status === 'idle' || status === 'failed' || status === 'cancelled') && (
        <button type="button" className="btn btn-primary mt-3" disabled={busy || !selected} onClick={startPayment}>
          {busy ? 'Starting UPI payment…' : 'Pay with UPI'}
        </button>
      )}
      {(status === 'processing' || status === 'pending') && (<p className="text-sm mt-3">Complete UPI in the checkout window…</p>)}
      {order && <p className="text-sm mt-2 text-muted">Order <code>{order.id}</code></p>}
      {status === 'paid' && (
        <div className="mt-3">
          <p className="text-sm" style={{ color: '#047857' }}>{message || 'Access activated.'}</p>
          <Link to="/" className="btn btn-primary mt-3">Go to Dashboard</Link>
        </div>
      )}
      {message && status !== 'paid' && <p className="text-sm mt-3 text-muted">{message}</p>}
      <p className="text-sm mt-4"><Link to="/course">← Back to course plans</Link></p>
    </div>
  )
}

export default function Checkout() {
  return (<RequireAuth><CheckoutInner /></RequireAuth>)
}
