import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function AdminPayments() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('SUBMITTED')

  async function load() {
    const res = await api.adminPayments(filter || undefined)
    if (!res.ok) {
      setError(res.error || 'Failed to load payment submissions')
      return
    }
    setError('')
    setOrders(res.orders || [])
  }

  useEffect(() => {
    load()
  }, [filter])

  async function verify(orderId) {
    if (!window.confirm('Verify this UPI payment and activate membership?')) return
    setBusyId(orderId)
    setMessage('')
    const res = await api.adminVerifyPayment(orderId)
    setBusyId(null)
    if (!res.ok) {
      setMessage(res.error || 'Verify failed')
      return
    }
    setMessage(res.message || 'Verified')
    await load()
  }

  async function reject(orderId) {
    const reason = window.prompt(
      'Rejection reason:',
      'Payment could not be verified'
    )
    if (reason == null) return
    setBusyId(orderId)
    setMessage('')
    const res = await api.adminRejectPayment(orderId, reason)
    setBusyId(null)
    if (!res.ok) {
      setMessage(res.error || 'Reject failed')
      return
    }
    setMessage(res.message || 'Rejected')
    await load()
  }

  return (
    <div>
      <h2 className="card-title mb-3">UPI Payment verification</h2>
      <p className="text-sm text-muted mb-3">
        Direct UPI payments are not confirmed automatically. Verify the student&apos;s UTR against your
        UPI app / bank statement, then activate membership.
      </p>

      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {['SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED', ''].map((s) => (
          <button
            key={s || 'ALL'}
            type="button"
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s || 'ALL'}
          </button>
        ))}
      </div>

      {error && <p className="qh-error">{error}</p>}
      {message && <p className="text-sm mb-2">{message}</p>}

      <div className="card">
        {orders.length === 0 && (
          <p className="text-sm text-muted">No payment submissions yet.</p>
        )}
        {orders.map((o) => (
          <div
            key={o.id}
            className="text-sm mb-3"
            style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 10 }}
          >
            <div>
              <strong>{o.id}</strong> · <span className="badge">{o.status}</span> · ₹
              {o.amountInr ?? Math.round((o.amountPaise || 0) / 100)}
            </div>
            <div>
              Student: {o.userName || '—'} · {o.userEmail || o.userId}
            </div>
            <div>Plan: {o.planName || o.planId || '—'}</div>
            <div>
              UTR: <code>{o.utr || '—'}</code>
            </div>
            <div>Submitted: {o.submittedAt || o.createdAt || '—'}</div>
            {o.rejectReason && <div>Reject reason: {o.rejectReason}</div>}
            {o.note && <div>Note: {o.note}</div>}
            {(o.status === 'SUBMITTED' || o.status === 'PENDING' || o.status === 'REJECTED') && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busyId === o.id || !o.utr}
                  onClick={() => verify(o.id)}
                >
                  Verify payment
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={busyId === o.id}
                  onClick={() => reject(o.id)}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
