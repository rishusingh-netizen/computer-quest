import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function VerifyCertificate() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await api.verifyCertificate(id.trim())
    setBusy(false)
    setResult(res)
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '24px auto' }}>
      <h2 className="card-title">Verify Certificate</h2>
      <p className="text-sm text-muted mb-3">
        Enter a Computer Quest certificate ID. Verification is served from the server database.
      </p>
      <form onSubmit={onSubmit}>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. CQ-XXXX-YYYY-ZZZZ"
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--cq-border)',
            marginBottom: 12,
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Verify
        </button>
      </form>
      {result && !result.found && (
        <p className="qh-error mt-3">No valid certificate found for that ID.</p>
      )}
      {result?.found && result.certificate && (
        <div className="mt-3" style={{ padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
          <p>
            <span className="badge badge-success">Valid</span>
          </p>
          <p className="mt-2">
            <strong>{result.certificate.studentName}</strong>
          </p>
          <p className="text-sm">Course: {result.certificate.courseName}</p>
          <p className="text-sm">
            Completed: {new Date(result.certificate.completedAt).toLocaleDateString('en-IN')}
          </p>
          <p className="text-sm">
            ID: <code>{result.certificate.id}</code>
          </p>
          <p className="text-sm text-muted mt-2">
            Certificate of Course Completion issued by Computer Quest. Not a government, university,
            UGC, AICTE or NSDC credential.
          </p>
          <Link to={`/certificate/${result.certificate.id}`} className="btn btn-secondary btn-sm mt-2">
            View certificate
          </Link>
        </div>
      )}
    </div>
  )
}
