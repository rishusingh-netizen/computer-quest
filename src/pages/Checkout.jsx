import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../config/course'
import { fetchCourseConfig, getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import RequireAuth from '../components/auth/RequireAuth'

function CheckoutInner() {
  const { hasAccess, accessDaysLeft } = useAuth()
  const [searchParams] = useSearchParams()
  const planFromUrl = searchParams.get('plan') || ''
  const [course, setCourse] = useState(() => getCourseConfig())
  const [selectedPlanId, setSelectedPlanId] = useState(planFromUrl || null)
  const [order, setOrder] = useState(null)
  const [upi, setUpi] = useState(null)
  const [step, setStep] = useState('select')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [utr, setUtr] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(true)

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
    order?.amountInr != null
      ? Number(order.amountInr)
      : order?.amountPaise != null
        ? Math.round(Number(order.amountPaise) / 100)
        : selected?.price != null
          ? selected.price
          : course.price

  async function startUpiOrder() {
    if (!selected) { setMessage('Please select a plan first.'); return }
    if (busy) return
    setBusy(true); setMessage('')
    const res = await api.createOrder({ planId: selected.id })
    setBusy(false)
    if (!res.ok) { setMessage(res.error || 'Could not create order'); return }
    setOrder(res.order); setUpi(res.upi || null); setStep('pay'); setMessage(res.message || '')
  }

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(upi?.upiId || '')
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch {
      setMessage('Could not copy — please copy the UPI ID manually.')
    }
  }

  function openUpiApp() {
    if (upi?.deepLink) window.location.href = upi.deepLink
  }

  async function submitUtr(e) {
    e?.preventDefault?.()
    if (!order?.id) return
    if (!utr.trim() || utr.trim().length < 6) {
      setMessage('Enter a valid UPI transaction ID / UTR (at least 6 characters).')
      return
    }
    if (busy) return
    setBusy(true); setMessage('')
    const res = await api.submitPayment({ orderId: order.id, utr: utr.trim(), paidAt: paidAt || undefined })
    setBusy(false)
    if (!res.ok) { setMessage(res.error || 'Could not submit payment details'); return }
    setOrder(res.order); setStep('done')
    setMessage(res.message || 'Details submitted. Access activates only after admin verifies your UTR.')
  }

  return (
    <div>
      <h1 className="page-title">Checkout — Direct UPI</h1>
      {hasAccess && (
        <p className="text-sm mb-3" style={{ color: '#047857' }}>
          You already have active access{accessDaysLeft != null ? ` (${accessDaysLeft} days left)` : ''}.
        </p>
      )}

      {step === 'select' && (
        <>
          {plans.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted mb-2">Select a plan</p>
              <div className="grid-2">
                {plans.map((p) => (
                  <button key={p.id} type="button" className="card"
                    style={{ textAlign: 'left', border: selectedPlanId === p.id ? '2px solid #4f46e5' : '1px solid #e2e8f0', cursor: 'pointer' }}
                    onClick={() => setSelectedPlanId(p.id)}>
                    <strong>{p.name}</strong>
                    <p className="text-sm text-muted mb-1">{p.durationDays} days access</p>
                    <p><strong>{formatPrice(p.price)}</strong></p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3"><strong>{selected?.name || 'Computer Quest'}</strong>{selected ? ` — ${selected.durationDays} days` : ''}</p>
          <p className="text-sm">Amount to pay: <strong>{formatPrice(displayPrice)}</strong></p>
          <p className="text-sm text-muted mt-2">
            Payment is made <strong>directly via UPI</strong> to the course owner. Course access is activated only after your UTR is verified — submitting details alone does not unlock the course.
          </p>
          <button type="button" className="btn btn-primary mt-3" disabled={busy || !selected} onClick={startUpiOrder}>
            {busy ? 'Creating order…' : 'Continue to UPI payment'}
          </button>
        </>
      )}

      {(step === 'pay' || step === 'submit') && order && upi && (
        <div className="card mt-3">
          <h2 className="card-title mb-2">Pay with UPI</h2>
          <p className="text-sm">Selected plan: <strong>{order.planName}</strong></p>
          <p className="text-sm">Amount: <strong>₹{order.amountInr}</strong> (pay this exact amount)</p>
          <p className="text-sm">Order reference: <code>{order.id}</code></p>
          <p className="text-sm mt-2">UPI ID: <strong>{upi.upiId}</strong>{upi.displayName ? ` (${upi.displayName})` : ''}</p>
          <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyUpiId}>{copied ? 'Copied!' : 'Copy UPI ID'}</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openUpiApp}>Pay using UPI</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowQr((v) => !v)}>{showQr ? 'Hide QR' : 'Show QR'}</button>
          </div>
          {showQr && upi.qrImageUrl && (
            <div className="mt-3">
              <img src={upi.qrImageUrl} alt="UPI QR code" width={240} height={240} style={{ border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <p className="text-sm text-muted mt-1">Scan with any UPI app and pay ₹{order.amountInr}</p>
            </div>
          )}
          <p className="text-sm mt-3" style={{ background: '#fef3c7', padding: 10, borderRadius: 8 }}>
            After payment, submit your UTR/transaction ID below. Your course access will be activated only after payment verification — this is not automatic.
          </p>
          {step === 'pay' && (
            <button type="button" className="btn btn-primary mt-3" onClick={() => setStep('submit')}>I have completed payment</button>
          )}
          {step === 'submit' && (
            <form className="mt-3" onSubmit={submitUtr}>
              <h3 className="card-title mb-2">Already paid? Submit payment details</h3>
              <label className="text-sm">UPI transaction ID / UTR *</label>
              <input className="input mb-2" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 123456789012" required />
              <label className="text-sm">Payment date/time (optional)</label>
              <input className="input mb-2" type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              <p className="text-sm text-muted mb-2">Plan: {order.planName} · Amount: ₹{order.amountInr} · Ref: {order.id}</p>
              <label className="flex items-center gap-2 text-sm mb-3">
                <input type="checkbox" required /> I have completed the UPI payment of ₹{order.amountInr}.
              </label>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit for verification'}</button>
            </form>
          )}
        </div>
      )}

      {step === 'done' && (
        <div className="card mt-3">
          <p className="text-sm" style={{ color: '#047857' }}>{message || 'Payment details submitted for verification.'}</p>
          <p className="text-sm mt-2">Status: <strong>{order?.status || 'SUBMITTED'}</strong>{order?.utr ? <> · UTR: <code>{order.utr}</code></> : null}</p>
          <p className="text-sm text-muted mt-2">You will get course access after an admin verifies this payment. This page does not automatically confirm UPI payments.</p>
          <Link to="/profile" className="btn btn-secondary mt-3">View profile</Link>
        </div>
      )}

      {message && step !== 'done' && <p className="text-sm mt-3 text-muted">{message}</p>}
      <p className="text-sm mt-4"><Link to="/course">← Back to course plans</Link></p>
    </div>
  )
}

export default function Checkout() {
  return (<RequireAuth><CheckoutInner /></RequireAuth>)
}
