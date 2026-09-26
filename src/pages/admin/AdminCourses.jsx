import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchCourseConfig, getCourseConfig, saveCourseConfig } from '../../services/courseConfig'
import { formatPrice } from '../../config/course'

function emptyPlan(id, defaults = {}) {
  return {
    id,
    name: defaults.name || id,
    description: defaults.description || '',
    price: defaults.price != null ? defaults.price : 0,
    durationDays: defaults.durationDays || 365,
    active: defaults.active !== false,
    sortOrder: defaults.sortOrder || 1,
    tier: defaults.tier || 'full',
    features: Array.isArray(defaults.features) ? defaults.features : [],
  }
}

export default function AdminCourses() {
  const { user } = useAuth()
  const [cfg, setCfg] = useState(() => getCourseConfig())
  const [plans, setPlans] = useState(() => getCourseConfig().plans || [])
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
        setPlans(Array.isArray(res.config.plans) ? res.config.plans : [])
      }
      if (!res.ok && res.error) setErr(res.error)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function updatePlan(index, patch) {
    setPlans((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  function updateFeature(planIndex, featureIndex, value) {
    setPlans((prev) =>
      prev.map((p, i) => {
        if (i !== planIndex) return p
        const features = [...(p.features || [])]
        features[featureIndex] = value
        return { ...p, features }
      })
    )
  }

  function addFeature(planIndex) {
    setPlans((prev) =>
      prev.map((p, i) => (i === planIndex ? { ...p, features: [...(p.features || []), ''] } : p))
    )
  }

  function removeFeature(planIndex, featureIndex) {
    setPlans((prev) =>
      prev.map((p, i) => {
        if (i !== planIndex) return p
        return { ...p, features: (p.features || []).filter((_, fi) => fi !== featureIndex) }
      })
    )
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    for (const p of plans) {
      const price = Number(p.price)
      if (!Number.isFinite(price) || price < 0) {
        setErr(`Plan “${p.name}”: enter a valid price in INR (0 or more).`)
        return
      }
      const days = Number(p.durationDays)
      if (!Number.isFinite(days) || days < 1) {
        setErr(`Plan “${p.name}”: duration must be at least 1 day.`)
        return
      }
    }
    setSaving(true)
    const res = await saveCourseConfig(user, {
      name: cfg.name,
      plans: plans.map((p, i) => ({
        ...p,
        price: Number(p.price) || 0,
        durationDays: Number(p.durationDays) || 365,
        features: (p.features || []).map((f) => String(f).trim()).filter(Boolean),
        sortOrder: p.sortOrder ?? i + 1,
        active: p.active !== false,
      })),
    })
    setSaving(false)
    if (!res.ok) {
      setErr(res.error || 'Save failed')
      return
    }
    setCfg(res.config)
    setPlans(Array.isArray(res.config.plans) ? res.config.plans : plans)
    let persistNote = ' Saved on this server instance.'
    if (res.persistedToGitHub || res.durable) {
      persistNote =
        ' Saved permanently to the production durable store (survives deploys and cold starts).'
    } else if (res.warning) {
      persistNote = ` Saved on this instance only. ${res.warning}`
    }
    setMsg(`Course plans updated.${persistNote} Public course page and checkout use these plans.`)
  }

  const activePlans = plans.filter((p) => p.active !== false)

  return (
    <div>
      <h2 className="card-title mb-3">Course Plans & Pricing</h2>
      <p className="text-sm text-muted mb-3">
        Manage the three Computer Quest enrollment plans. Set any INR price, duration, name,
        description and features for each plan. Activate or deactivate plans anytime. Nothing is
        hard-coded — the public course page and checkout always use the latest saved plans.
      </p>

      <div className="card mb-4">
        <h3 className="font-semibold mb-2">Active plans summary</h3>
        {loading ? (
          <p className="text-sm text-muted">Loading from server…</p>
        ) : activePlans.length === 0 ? (
          <p className="text-sm text-muted">No active plans. Activate at least one plan below.</p>
        ) : (
          <div className="grid-3" style={{ gap: 12 }}>
            {activePlans.map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--cq-border)', borderRadius: 10, padding: 12 }}>
                <p className="font-semibold text-sm">{p.name}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                  {formatPrice(p.price)}
                </p>
                <p className="text-sm text-muted">{p.durationDays} days access</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={save}>
        {plans.map((plan, index) => (
          <div key={plan.id || index} className="card mb-4">
            <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
              <h3 className="font-semibold">
                Plan {index + 1}
                <span className="text-sm text-muted" style={{ fontWeight: 400 }}>
                  {' '}
                  · {plan.id}
                </span>
              </h3>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plan.active !== false}
                  onChange={(e) => updatePlan(index, { active: e.target.checked })}
                />
                Active (shown on public page)
              </label>
            </div>

            <label className="text-sm">Name</label>
            <input
              className="qh-input-row"
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid var(--cq-border)' }}
              value={plan.name || ''}
              onChange={(e) => updatePlan(index, { name: e.target.value })}
              required
            />

            <label className="text-sm">Description</label>
            <textarea
              style={{
                width: '100%',
                marginBottom: 12,
                padding: 10,
                borderRadius: 8,
                border: '1px solid var(--cq-border)',
                minHeight: 72,
              }}
              value={plan.description || ''}
              onChange={(e) => updatePlan(index, { description: e.target.value })}
            />

            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <label className="text-sm">Price (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  style={{
                    width: '100%',
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid var(--cq-border)',
                  }}
                  value={plan.price ?? ''}
                  onChange={(e) => updatePlan(index, { price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  style={{
                    width: '100%',
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid var(--cq-border)',
                  }}
                  value={plan.durationDays ?? ''}
                  onChange={(e) => updatePlan(index, { durationDays: e.target.value })}
                  required
                />
                <p className="text-sm text-muted" style={{ marginTop: -8 }}>
                  Examples: 182 ≈ 6 months · 365 = 1 year · 730 = 2 years
                </p>
              </div>
            </div>

            <label className="text-sm">Included features (one per line item)</label>
            {(plan.features || []).map((f, fi) => (
              <div key={fi} className="flex gap-2 mb-2" style={{ alignItems: 'center' }}>
                <input
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid var(--cq-border)',
                  }}
                  value={f}
                  onChange={(e) => updateFeature(index, fi, e.target.value)}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFeature(index, fi)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={() => addFeature(index)}>
              Add feature
            </button>
          </div>
        ))}

        {plans.length === 0 && !loading && (
          <p className="text-sm text-muted mb-3">
            No plans loaded yet. Save once after deploy to bootstrap the three default plans, then edit
            prices.
          </p>
        )}

        {err && <p className="qh-error mb-2">{err}</p>}
        {msg && (
          <p className="text-sm mb-2" style={{ color: '#047857' }}>
            {msg}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save all plans'}
        </button>
        <p className="text-sm text-muted mt-2">
          After save, students see these plans on the Course page and pay the selected plan amount in
          mock checkout.
        </p>
      </form>
    </div>
  )
}
