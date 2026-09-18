import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../config/course'
import { getCourseConfig } from '../services/courseConfig'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Checkout() {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const course = getCourseConfig()
  const [plan, setPlan] = useState('monthly')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const price = plan === 'yearly' ? (course.yearlyPrice || course.price * 10) : course.price

  async function handlePay() {
    if (!isLoggedIn) {
      setError('Please log in first')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await api.checkout({ plan })
      if (!res.ok) {
        setError(res.error || 'Checkout failed')
        setBusy(false)
        return
      }
      await refreshUser?.()
      setDone(true)
    } catch (e) {
      setError('Network error')
    }
    setBusy(false)
  }

  if (done) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '24px auto' }}>
        <h2 className="card-title">Enrollment complete</h2>
        <p className="text-sm mt-2">Your membership is now active. Start learning!</p>
        <Link to="/" className="btn btn-primary mt-3">Go to Dashboard</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 className="card-title mb-3">Checkout</h2>
      <div className="card mb-4">
        <h3 className="font-semibold">{course.name}</h3>
        <p className="text-sm text-muted">{course.tagline || course.description}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`btn btn-sm ${plan === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPlan('monthly')}
          >
            Monthly {formatPrice(course.price)}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${plan === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPlan('yearly')}
          >
            Yearly {formatPrice(course.yearlyPrice || course.price * 10)}
          </button>
        </div>
        <p className="mt-3 font-semibold" style={{ fontSize: '1.25rem' }}>
          {formatPrice(price)}
        </p>
        <p className="text-sm text-muted">Mock payment for demo. No real charge.</p>
        {error && <p className="qh-error mt-2">{error}</p>}
        {!isLoggedIn ? (
          <Link to="/login" className="btn btn-primary mt-3">Log in to enroll</Link>
        ) : (
          <button type="button" className="btn btn-primary mt-3" disabled={busy} onClick={handlePay}>
            {busy ? 'Processing…' : 'Complete enrollment'}
          </button>
        )}
      </div>
    </div>
  )
}
