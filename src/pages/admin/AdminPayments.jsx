import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function AdminPayments() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await api.adminOrders()
      if (cancelled) return
      if (!res.ok) {
        setError(res.error || 'Failed to load orders')
        return
      }
      setOrders(res.orders || [])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h2 className="card-title mb-3">Payments / Orders</h2>
      <p className="text-sm text-muted mb-3">
        Orders are created and confirmed on the server. Client-side “success” never grants membership.
        Replace the mock confirm adapter with Stripe/Razorpay webhook signature verification before
        live payments.
      </p>
      {error && <p className="qh-error">{error}</p>}
      <div className="card">
        {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
        {orders.map((o) => (
          <div
            key={o.id}
            className="text-sm mb-3"
            style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 8 }}
          >
            <div>
              <strong>{o.id}</strong> · {o.status} · ₹{((o.amount_paise || 0) / 100).toLocaleString('en-IN')}{' '}
              {o.currency || 'INR'}
            </div>
            <div>User: {o.user_id}</div>
            <div>Provider: {o.provider || 'mock'} · Ref: {o.provider_ref || '—'}</div>
            <div>Created: {o.created_at}</div>
            {o.updated_at && <div>Updated: {o.updated_at}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
