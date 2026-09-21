import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate(location.state?.from || '/', { replace: true })
  }, [isLoggedIn, navigate, location.state])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await login({ email, password })
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate(location.state?.from || '/', { replace: true })
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2 className="card-title">Log in</h2>
      <p className="text-sm text-muted mb-3">Access your Computer Quest account. Owner: use your admin email (e.g. admin@computerquest.local).</p>
      <form onSubmit={onSubmit}>
        <label className="text-sm">Email</label>
        <input
          className="qh-input-row"
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
          type="text" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label className="text-sm">Password</label>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="qh-error mb-2">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p className="text-sm mt-3">
        New student? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  )
}
