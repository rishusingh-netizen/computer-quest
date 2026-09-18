import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await signup({ name, email, password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/course', { replace: true })
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2 className="card-title">Create account</h2>
      <p className="text-sm text-muted mb-3">Sign up to enroll in Computer Quest.</p>
      <form onSubmit={onSubmit}>
        <label className="text-sm">Name</label>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <label className="text-sm">Email</label>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label className="text-sm">Password (min 6 characters)</label>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        {error && <p className="qh-error mb-2">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm mt-3">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
