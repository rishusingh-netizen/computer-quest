import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'

export default function CertificateView() {
  const { certId } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const res = await api.verifyCertificate(certId)
      if (!cancelled) {
        setCert(res.found ? res.certificate : null)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [certId])

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '24px auto' }}>
        <p className="text-sm text-muted">Loading certificate…</p>
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '24px auto' }}>
        <h2 className="card-title">Certificate not found</h2>
        <p className="text-sm text-muted">Check the certificate ID and try again.</p>
        <Link to="/verify" className="btn btn-secondary mt-3">
          Verify a certificate
        </Link>
      </div>
    )
  }

  const dateStr = cert.completedAt
    ? new Date(cert.completedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <div>
      <div className="no-print flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <Link to="/verify" className="btn btn-secondary">
          Verify
        </Link>
      </div>

      <div className="certificate-sheet">
        <div className="certificate-border">
          <p className="text-sm" style={{ letterSpacing: 2, textTransform: 'uppercase' }}>
            Computer Quest
          </p>
          <h1 style={{ fontSize: '1.75rem', margin: '12px 0' }}>Certificate of Course Completion</h1>
          <p className="text-sm text-muted">This certifies that</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0' }}>{cert.studentName}</p>
          <p className="text-sm">
            has successfully completed the course
          </p>
          <p style={{ fontWeight: 700, margin: '8px 0' }}>{cert.courseName || 'Computer Quest'}</p>
          <p className="text-sm text-muted mt-2">Completion date: {dateStr}</p>
          <p className="text-sm mt-2">
            Certificate ID: <code>{cert.id}</code>
          </p>
          <p className="text-sm text-muted mt-3" style={{ maxWidth: 420, margin: '12px auto 0' }}>
            Issued by Computer Quest. This is a Certificate of Course Completion for skills learned in
            the Computer Quest program. It is not a government, university, UGC, AICTE or NSDC
            recognised credential.
          </p>
        </div>
      </div>
    </div>
  )
}
