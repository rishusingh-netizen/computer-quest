import { useState, useEffect, useRef, useCallback } from 'react'

const TASKS = [
  { id: 'click', label: 'Single click the target', type: 'click' },
  { id: 'dbl', label: 'Double-click the target', type: 'dblclick' },
  { id: 'right', label: 'Right-click the target', type: 'contextmenu' },
  { id: 'move', label: 'Move the pointer over the target', type: 'mouseenter' },
]

export default function MousePractice({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')
  const task = TASKS[index]

  const succeed = useCallback(() => {
    if (done) return
    scoreRef.current += 1
    setScore(scoreRef.current)
    setFeedback('✓ Nice!')
    setDone(true)
  }, [done])

  function next() {
    if (index + 1 >= TASKS.length) {
      onComplete?.(scoreRef.current, TASKS.length)
      return
    }
    setIndex((i) => i + 1)
    setDone(false)
    setFeedback('')
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Task {index + 1} / {TASKS.length}
        </span>
        <span className="badge badge-primary">{score} done</span>
      </div>
      <p className="font-semibold mb-4">{task.label}</p>
      <div
        role="button"
        tabIndex={0}
        className="hw-card"
        style={{
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          background: done ? '#d1fae5' : '#eef2ff',
        }}
        onClick={(e) => {
          if (task.type === 'click') succeed()
        }}
        onDoubleClick={() => {
          if (task.type === 'dblclick') succeed()
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          if (task.type === 'contextmenu') succeed()
        }}
        onMouseEnter={() => {
          if (task.type === 'mouseenter') succeed()
        }}
      >
        <span style={{ fontSize: 28 }}>🎯</span>
        <span className="ml-2">Target</span>
      </div>
      {feedback && <p className="mt-3 text-sm">{feedback}</p>}
      {done && (
        <button type="button" className="btn btn-primary mt-3" onClick={next}>
          {index + 1 >= TASKS.length ? 'Finish' : 'Next task →'}
        </button>
      )}
      <p className="text-sm text-muted mt-3">Simulated mouse practice — works with trackpad or mouse.</p>
    </div>
  )
}
