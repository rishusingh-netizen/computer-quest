import { useState, useEffect, useCallback, useRef } from 'react'

const CHALLENGES = [
  { id: 1, label: 'Copy', keys: ['Control', 'c'], hint: 'Ctrl + C' },
  { id: 2, label: 'Paste', keys: ['Control', 'v'], hint: 'Ctrl + V' },
  { id: 3, label: 'Cut', keys: ['Control', 'x'], hint: 'Ctrl + X' },
  { id: 4, label: 'Save', keys: ['Control', 's'], hint: 'Ctrl + S' },
  { id: 5, label: 'Select all', keys: ['Control', 'a'], hint: 'Ctrl + A' },
  { id: 6, label: 'Undo', keys: ['Control', 'z'], hint: 'Ctrl + Z' },
]

function normalizeKey(k) {
  if (k === 'Control' || k === 'Meta') return 'Control'
  return k.length === 1 ? k.toLowerCase() : k
}

export default function KeyboardPractice({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [pressed, setPressed] = useState([])
  const [status, setStatus] = useState(null) // success | fail | null
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const doneRef = useRef(false)

  const challenge = CHALLENGES[index]
  const needed = challenge.keys.map(normalizeKey)

  const onKeyDown = useCallback(
    (e) => {
      if (doneRef.current || status === 'success') return
      e.preventDefault()
      const k = normalizeKey(e.key === 'Meta' ? 'Control' : e.key)
      setPressed((prev) => {
        if (prev.includes(k)) return prev
        return [...prev, k]
      })
    },
    [status],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  useEffect(() => {
    if (status || pressed.length === 0) return
    const ok = needed.every((k) => pressed.includes(k))
    const extra = pressed.filter((k) => !needed.includes(k))
    if (ok && extra.length === 0 && pressed.length === needed.length) {
      setStatus('success')
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else if (pressed.length >= needed.length) {
      // allow a moment; if wrong combo length matched, mark fail on timeout
      const t = setTimeout(() => {
        if (!needed.every((k) => pressed.includes(k))) setStatus('fail')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [pressed, needed, status])

  function next() {
    if (index + 1 >= CHALLENGES.length) {
      doneRef.current = true
      onComplete?.(scoreRef.current, CHALLENGES.length)
      return
    }
    setIndex((i) => i + 1)
    setPressed([])
    setStatus(null)
  }

  function retry() {
    setPressed([])
    setStatus(null)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Shortcut {index + 1} / {CHALLENGES.length}
        </span>
        <span className="badge badge-primary">{score} correct</span>
      </div>
      <p className="font-semibold mb-2" style={{ fontSize: '1.15rem' }}>
        Press: {challenge.hint}
      </p>
      <p className="text-sm text-muted mb-3">Task: {challenge.label}</p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {needed.map((k) => (
          <span
            key={k}
            className="badge"
            style={{
              background: pressed.includes(k) ? '#d1fae5' : '#f1f5f9',
              color: '#0f172a',
              padding: '8px 12px',
              fontSize: 14,
            }}
          >
            {k === 'Control' ? 'Ctrl' : k.toUpperCase()}
          </span>
        ))}
      </div>
      <p className="text-sm mb-3">
        Keys detected: {pressed.length ? pressed.map((k) => (k === 'Control' ? 'Ctrl' : k)).join(' + ') : '—'}
      </p>
      {status === 'success' && (
        <div className="text-sm mb-3" style={{ background: '#d1fae5', padding: 10, borderRadius: 8 }}>
          ✓ Correct shortcut!
        </div>
      )}
      {status === 'fail' && (
        <div className="text-sm mb-3" style={{ background: '#fee2e2', padding: 10, borderRadius: 8 }}>
          ✗ Not quite — try {challenge.hint}
        </div>
      )}
      <div className="flex gap-2">
        {status === 'fail' && (
          <button type="button" className="btn btn-secondary" onClick={retry}>
            Try again
          </button>
        )}
        {status === 'success' && (
          <button type="button" className="btn btn-primary" onClick={next}>
            {index + 1 >= CHALLENGES.length ? 'Finish' : 'Next →'}
          </button>
        )}
      </div>
      <p className="text-sm text-muted mt-3">Click here first so key presses are captured, then use your keyboard.</p>
    </div>
  )
}
