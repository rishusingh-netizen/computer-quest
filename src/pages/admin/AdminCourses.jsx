import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchCourseConfig, getCourseConfig, saveCourseConfig } from '../../services/courseConfig'
import { formatPrice } from '../../config/course'

export default function AdminCourses() {
  const { user } = useAuth()
  const [cfg, setCfg] = useState(() => getCourseConfig())
  const [priceInput, setPriceInput] = useState(() => {
    const c = getCourseConfig()
    return c.price != null ? String(c.price) : ''
  })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const res = await fetchCourseConfig()
      if (cancelled) return
      if (res.config) {
        setCfg(res.config)
        setPriceInput(res.config.price != null ? String(res.config.price) : '')
      }
      if (!res.ok && res.error) setErr(res.error)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function save(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    const price = Number(priceInput)
    if (!Number.isFinite(price) || price < 0) {
      setErr('Enter a valid price in INR (0 or more).')
      return
    }
    setSaving(true)
    const res = await saveCourseConfig(user, {
      name: cfg.name,
      description: cfg.description,
      tagline: cfg.tagline,
      price,
      durationYears: Number(cfg.durationYears) || 2,
    })
    setSaving(false)
    if (!res.ok) {
      setErr(res.error || 'Save failed')
      return
    }
    setCfg(res.config)
    setPriceInput(res.config.price != null ? String(res.config.price) : String(price))
    let persistNote = ' Saved on this server instance.'
    if (res.persistedToGitHub || res.durable) {
      persistNote =
        ' Saved permanently to the production durable store (survives deploys and cold starts).'
    } else if (res.warning) {
      persistNote = ` Saved on this instance only. ${res.warning}`
    }
    setMsg(
      `Active price is now ${formatPrice(res.config.price)}.${persistNote} Public course page and checkout use this amount.`
    )
  }

  return (
    <div>
      <h2 className="card-title mb-3">Course settings</h2>
      <p className="text-sm text-muted mb-3">
        Set the membership price in INR. It is stored server-side in the durable course config
        (not browser localStorage) and is used by the public course page and enrollment (mock payment).
        Change it anytime — students always see the latest saved price after save.
      </p>

      <div className="card mb-4" style={{ maxWidth: 560 }}>
        <h3 className="font-semibold mb-1">Currently active price</h3>
        {loading ? (
          <p className="text-sm text-muted">Loading from server…</p>
        ) : (
          <>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0' }}>
              {formatPrice(cfg.price)}
            </p>
            <p className="text-sm text-muted">
              {cfg.name} · {cfg.durationYears || 2} year access
              {cfg.updatedAt ? ` · Updated ${new Date(cfg.updatedAt).toLocaleString('en-IN')}` : ''}
            </p>
          </>
        )}
      </div>

      <form className="card" onSubmit={save} style={{ maxWidth: 560 }}>
        <label className="text-sm">Course name</label>
        <input
          style={inp}
          value={cfg.name || ''}
          onChange={(e) => setCfg({ ...cfg, name: e.target.value })}
        />
        <label className="text-sm">Tagline</label>
        <input
          style={inp}
          value={cfg.tagline || ''}
          onChange={(e) => setCfg({ ...cfg, tagline: e.target.value })}
        />
        <label className="text-sm">Description</label>
        <textarea
          style={{ ...inp, minHeight: 80 }}
          value={cfg.description || ''}
          onChange={(e) => setCfg({ ...cfg, description: e.target.value })}
        />
        <label className="text-sm">Price (INR)</label>
        <input
          type="number"
          name="price"
          min="0"
          step="1"
          required
          style={inp}
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          placeholder="e.g. 1999"
        />
        <p className="text-sm text-muted" style={{ marginTop: -8, marginBottom: 12 }}>
          Enter whole rupees (example: 1999 for ₹1,999). Stored server-side as paise for payment providers.
        </p>
        <label className="text-sm">Duration (years)</label>
        <input
          type="number"
          name="durationYears"
          min="1"
          step="1"
          style={inp}
          value={cfg.durationYears ?? 2}
          onChange={(e) => setCfg({ ...cfg, durationYears: e.target.value })}
        />
        <p className="text-sm text-muted">Course ID: {cfg.id} · Batch: {cfg.batchId}</p>
        {err && <p className="qh-error mt-2">{err}</p>}
        {msg && <p className="text-sm mt-2" style={{ color: '#047857' }}>{msg}</p>}
        <button type="submit" className="btn btn-primary mt-2" disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save price & course settings'}
        </button>
      </form>
    </div>
  )
}

const inp = {
  width: '100%',
  marginBottom: 12,
  padding: 10,
  borderRadius: 8,
  border: '1px solid var(--cq-border)',
  background: 'var(--cq-surface)',
  color: 'inherit',
}
