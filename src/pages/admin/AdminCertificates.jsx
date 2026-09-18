import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Link } from 'react-router-dom'

export default function AdminCertificates() {
  const [certs, setCerts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await api.adminCertificates()
      if (cancelled) return
      if (!res.ok) {
        setError(res.error || 'Failed to load certificates')
        return
      }
      setCerts(res.certificates || [])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h2 className="card-title mb-3">Certificates</h2>
      <p className="text-sm text-muted mb-3">Issued certificates stored in the server database.</p>
      {error && <p className="qh-error">{error}</p>}
      <div className="card">
        {certs.length === 0 && <p className="text-sm text-muted">No certificates issued yet.</p>}
        {certs.map((c) => (
          <div
            key={c.id}
            className="text-sm mb-3"
            style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 8 }}
          >
            <div>
              <strong>{c.student_name || c.studentName || '—'}</strong> · <code>{c.id}</code>
            </div>
            <div>{c.course_name || c.courseName || 'Computer Quest'}</div>
            <div className="text-muted">
              Issued: {String(c.issued_at || c.completedAt || '').slice(0, 10)}
            </div>
            <Link to={`/certificate/${c.id}`} className="text-sm" style={{ color: 'var(--cq-primary)' }}>
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
