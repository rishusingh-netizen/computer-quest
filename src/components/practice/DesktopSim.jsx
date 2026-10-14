import { useState, useRef } from 'react'

const ICONS = [
  { id: 'docs', label: 'Documents', emoji: '📁' },
  { id: 'pics', label: 'Pictures', emoji: '🖼️' },
  { id: 'trash', label: 'Recycle Bin', emoji: '🗑️' },
  { id: 'browser', label: 'Browser', emoji: '🌐' },
]

const TASKS = [
  { id: 1, text: 'Open Documents folder', match: 'docs' },
  { id: 2, text: 'Open Pictures', match: 'pics' },
  { id: 3, text: 'Open the Browser', match: 'browser' },
  { id: 4, text: 'Open Recycle Bin', match: 'trash' },
]

export default function DesktopSim({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(null)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [msg, setMsg] = useState('')
  const task = TASKS[index]

  function handleOpen(id) {
    setOpen(id)
    if (id === task.match) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setMsg('✓ Correct icon!')
    } else {
      setMsg('✗ That is not the requested item.')
    }
  }

  function next() {
    if (index + 1 >= TASKS.length) {
      onComplete?.(scoreRef.current, TASKS.length)
      return
    }
    setIndex((i) => i + 1)
    setOpen(null)
    setMsg('')
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Desktop simulation</span>
        <span className="badge badge-primary">
          {index + 1}/{TASKS.length}
        </span>
      </div>
      <p className="font-semibold mb-3">Task: {task.text}</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          background: 'linear-gradient(180deg,#1e3a5f,#0f172a)',
          padding: 16,
          borderRadius: 12,
          minHeight: 200,
        }}
      >
        {ICONS.map((ic) => (
          <button
            key={ic.id}
            type="button"
            className="hw-card"
            style={{
              background: open === ic.id ? '#dbeafe' : 'rgba(255,255,255,0.9)',
              textAlign: 'center',
            }}
            onClick={() => handleOpen(ic.id)}
          >
            <div style={{ fontSize: 28 }}>{ic.emoji}</div>
            <div className="text-sm">{ic.label}</div>
          </button>
        ))}
      </div>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      {msg.startsWith('✓') && (
        <button type="button" className="btn btn-primary mt-3" onClick={next}>
          {index + 1 >= TASKS.length ? 'Finish' : 'Next task →'}
        </button>
      )}
      <p className="text-sm text-muted mt-3">Simulated desktop — does not control your real computer.</p>
    </div>
  )
}
