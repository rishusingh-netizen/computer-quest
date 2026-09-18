import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function AdminStudents() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await api.adminUsers()
      if (cancelled) return
      if (!res.ok) {
        setError(res.error || 'Failed to load students')
        return
      }
      setUsers(res.users || [])
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2 className="card-title mb-3">Students</h2>
      {error && <p className="qh-error">{error}</p>}
      <div className="card">
        {users.length === 0 && <p className="text-sm text-muted">No students yet.</p>}
        {users.map((u) => (
          <div key={u.id} className="text-sm mb-2" style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 6 }}>
            <strong>{u.name}</strong> · {u.email}
            <div className="text-muted">Role: {u.role} · Joined: {String(u.created_at || '').slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
