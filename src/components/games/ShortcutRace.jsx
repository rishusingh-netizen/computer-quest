import { useState, useEffect, useCallback, useRef } from 'react'

const SHORTCUTS = [
  { display: 'Ctrl + C', letter: 'c', label: 'Copy' },
  { display: 'Ctrl + V', letter: 'v', label: 'Paste' },
  { display: 'Ctrl + X', letter: 'x', label: 'Cut' },
  { display: 'Ctrl + Z', letter: 'z', label: 'Undo' },
  { display: 'Ctrl + S', letter: 's', label: 'Save' },
  { display: 'Ctrl + A', letter: 'a', label: 'Select All' },
  { display: 'Ctrl + B', letter: 'b', label: 'Bold' },
  { display: 'Ctrl + P', letter: 'p', label: 'Print' },
]

const DURATION = 45

export default function ShortcutRace({ onFinish }) {
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [index, setIndex] = useState(0)
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [running, setRunning] = useState(true)
  const finishedRef = useRef(false)
  const lockedRef = useRef(false)

  const current = SHORTCUTS[index % SHORTCUTS.length]

  const endGame = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setRunning(false)
    onFinish(scoreRef.current, {
      detail: `${scoreRef.current} correct · ${misses} missed in ${DURATION}s`,
    })
  }, [onFinish, misses])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          endGame()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, endGame])

  useEffect(() => {
    if (!running) return
    function onKeyDown(e) {
      if (lockedRef.current) return
      if (e.ctrlKey || e.metaKey) e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && e.key.length === 1) {
        lockedRef.current = true
        const letter = e.key.toLowerCase()
        if (letter === current.letter) {
          scoreRef.current += 1
          setScore(scoreRef.current)
          setFeedback('correct')
        } else {
          setMisses((m) => m + 1)
          setFeedback('wrong')
        }
        setTimeout(() => {
          setFeedback(null)
          setIndex((i) => i + 1)
          lockedRef.current = false
        }, 350)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [running, current])

  function skip() {
    if (lockedRef.current || !running) return
    lockedRef.current = true
    setMisses((m) => m + 1)
    setFeedback('wrong')
    setTimeout(() => {
      setFeedback(null)
      setIndex((i) => i + 1)
      lockedRef.current = false
    }, 300)
  }

  if (!running) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="font-semibold">Time&apos;s up!</p>
        <p className="mt-2">Score: {score}</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">⏱ {timeLeft}s</span>
        <span className="badge badge-primary">Score {score}</span>
      </div>
      <div className="shortcut-display">
        <p className="text-sm text-muted mb-1">{current.label}</p>
        <div className="shortcut-keys">{current.display}</div>
      </div>
      {feedback === 'correct' && (
        <p className="mt-3 text-sm" style={{ color: '#047857', textAlign: 'center' }}>
          ✓ Nice!
        </p>
      )}
      {feedback === 'wrong' && (
        <p className="mt-3 text-sm" style={{ color: '#b91c1c', textAlign: 'center' }}>
          ✗ Miss
        </p>
      )}
      <div className="flex gap-2 mt-4" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={skip}>
          Skip
        </button>
      </div>
      <p className="text-sm text-muted mt-3" style={{ textAlign: 'center' }}>
        Press the shortcut on your keyboard
      </p>
    </div>
  )
}
