import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { evaluateCompletion } from '../services/completion'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useState } from 'react'
import { Trophy, CheckCircle } from '../components/ui/Icons'

export default function Completion() {
  const progress = useProgress()
  const { isLoggedIn } = useAuth()
  const completion = evaluateCompletion(progress)
  const [issuing, setIssuing] = useState(false)
  const [cert, setCert] = useState(null)
  const [error, setError] = useState('')

  async function handleIssue() {
    if (!isLoggedIn || !completion.eligible) return
    setIssuing(true)
    setError('')
    const res = await api.createCertificate({ course_name: 'Computer Quest' })
    setIssuing(false)
    if (!res.ok) {
      setError(res.error || 'Could not issue certificate')
      return
    }
    setCert(res.certificate)
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Trophy size={28} color="#4f46e5" />
          <h2 className="card-title">Course Completion</h2>
        </div>
        <p className="text-sm text-muted mb-3">
          Track your progress toward a Certificate of Course Completion.
        </p>
        <div className="progress-bar mb-2">
          <div className="progress-bar-fill" style={{ width: `${completion.percent}%` }} />
        </div>
        <p className="font-semibold">{completion.percent}% complete</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-value">{completion.lessonsDone}/{completion.lessonsTotal}</div>
          <div className="stat-label">Lessons</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{completion.practiceDone}/{completion.practiceTotal}</div>
          <div className="stat-label">Practice</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{completion.testsPassed}/{completion.testsTotal}</div>
          <div className="stat-label">Tests passed</div>
        </div>
      </div>

      {completion.missing?.length > 0 && (
        <div className="card mb-4">
          <h3 className="card-title mb-2">Still needed</h3>
          <ul className="text-sm" style={{ paddingLeft: 18 }}>
            {completion.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {completion.eligible ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} color="#10b981" />
            <strong>You are eligible for a certificate</strong>
          </div>
          {cert ? (
            <p className="text-sm">
              Certificate ID: <code>{cert.id}</code>{' '}
              <Link to={`/certificate/${cert.id}`}>View</Link>
            </p>
          ) : (
            <button type="button" className="btn btn-primary mt-2" disabled={issuing || !isLoggedIn} onClick={handleIssue}>
              {issuing ? 'Issuing…' : 'Issue certificate'}
            </button>
          )}
          {error && <p className="qh-error mt-2">{error}</p>}
          {!isLoggedIn && <p className="text-sm text-muted mt-2">Log in to issue your certificate.</p>}
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-muted">Keep learning and practicing to become eligible.</p>
          <Link to="/learn" className="btn btn-primary btn-sm mt-3">Continue learning</Link>
        </div>
      )}
    </div>
  )
}
