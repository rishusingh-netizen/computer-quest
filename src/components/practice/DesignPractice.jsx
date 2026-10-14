import { useState, useRef } from 'react'

export default function DesignPractice({ onComplete }) {
  const [bg, setBg] = useState('#4f46e5')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [align, setAlign] = useState('center')
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)

  function check() {
    let s = 0
    if (title.trim().length >= 3) s += 1
    if (subtitle.trim().length >= 3) s += 1
    if (bg && bg !== '#ffffff') s += 1
    if (align) s += 1
    scoreRef.current = s
    if (s >= 3) {
      setMsg(`✓ Design basics complete (${s}/4).`)
      setDone(true)
      onComplete?.(s, 4)
    } else {
      setMsg('Add a title, subtitle, and pick a background color.')
    }
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">Design basics (simulation)</h3>
      <p className="text-sm text-muted mb-3">Create a simple poster card layout in the browser.</p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <label className="text-sm">
          Background{' '}
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
        </label>
        <select className="input" value={align} onChange={(e) => setAlign(e.target.value)} style={{ width: 140 }}>
          <option value="left">Align left</option>
          <option value="center">Align center</option>
          <option value="right">Align right</option>
        </select>
      </div>
      <input className="input mb-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Poster title" />
      <input
        className="input mb-3"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Subtitle"
      />
      <div
        style={{
          background: bg,
          color: '#fff',
          padding: 24,
          borderRadius: 12,
          textAlign: align,
          minHeight: 120,
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20 }}>{title || 'Title preview'}</div>
        <div style={{ opacity: 0.9 }}>{subtitle || 'Subtitle preview'}</div>
      </div>
      {!done && (
        <button type="button" className="btn btn-primary" onClick={check}>
          Finish design
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
