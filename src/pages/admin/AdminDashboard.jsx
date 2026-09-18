import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [s, o] = await Promise.all([api.adminStats(), api.adminOrders()])
      if (cancelled) return
      if (!s.ok) {
        setError(s.error || 'Failed to load stats')
        return
      }
      setStats(s.stats)
      setOrders((o.orders || []).slice(0, 8))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <div className="card">{error}</div>
  if (!stats) return <div className="card">Loading…</div>

  const cards = [
    ['Total students', stats.totalStudents],
    ['Active memberships', stats.activeMemberships],
    ['Paid orders', stats.paidOrders],
    ['Certificates', stats.certificates],
  ]

  return (
    <div>
      <h2 className="card-title mb-3">Admin Dashboard</h2>
      <p className="text-sm text-muted mb-3">Live data from the server database.</p>
      <div className="grid-4 mb-4">
        {cards.map(([label, val]) => (
          <div key={label} className="card stat-card">
            <div className="stat-value">{val ?? 0}</div>
            <div className="stat-label text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title mb-2">Recent orders</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="text-sm mb-2"
              style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 6 }}
            >
              <code>{o.id}</code> · {o.status} · ₹{((o.amount_paise || 0) / 100).toLocaleString('en-IN')} ·{' '}
              {String(o.created_at || '').slice(0, 10)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
