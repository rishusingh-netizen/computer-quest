import { useState, useEffect, useRef } from 'react'

const PROMPTS = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes progress when you type every day.',
  'Computers help students learn faster and better.',
  'Save your work often with keyboard shortcuts.',
]

export default function TypingRace({ onFinish }) {
  const [promptIndex, setPromptIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)
  const startTime = useRef(null)
  const totalChars = useRef(0)
  const totalCorrect = useRef(0)
  const inputRef = useRef(null)

  const prompt = PROMPTS[promptIndex]

  useEffect(() => {
    inputRef.current?.focus()
  }, [promptIndex])

  function onChange(e) {
    const val = e.target.value
    if (!startTime.current) startTime.current = Date.now()
    setTyped(val)
    if (val === prompt) {
      totalChars.current += prompt.length
      totalCorrect.current += prompt.length
      if (promptIndex + 1 >= PROMPTS.length) {
        finish()
      } else {
        setPromptIndex((i) => i + 1)
        setTyped('')
      }
    }
  }

  function finish() {
    if (done) return
    setDone(true)
    const elapsedMin = Math.max((Date.now() - (startTime.current || Date.now())) / 60000, 1 / 60)
    const wpm = Math.round(totalCorrect.current / 5 / elapsedMin)
    const accuracy = totalChars.current
      ? Math.round((totalCorrect.current / Math.max(totalChars.current, typed.length || 1)) * 100)
      : 100
    // Score blends WPM and finishing all prompts
    const score = Math.min(100, Math.max(10, wpm + PROMPTS.length * 5))
    onFinish(score, { detail: `${wpm} WPM · ${accuracy}% accuracy` })
  }

  // Track mistyped chars roughly for accuracy display
  const correctSoFar = (() => {
    let n = 0
    for (let i = 0; i < typed.length && i < prompt.length; i++) {
      if (typed[i] === prompt[i]) n++
    }
    return n
  })()

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Prompt {promptIndex + 1} / {PROMPTS.length}
        </span>
      </div>
      <p className="text-sm text-muted mb-2">Type the sentence exactly, then the next one appears.</p>
      <p
        className="mb-3"
        style={{
          fontSize: '1.15rem',
          fontFamily: 'monospace',
          padding: 12,
          background: '#f8fafc',
          borderRadius: 8,
        }}
      >
        {prompt.split('').map((ch, i) => {
          let color = '#64748b'
          if (i < typed.length) color = typed[i] === ch ? '#059669' : '#dc2626'
          return (
            <span key={i} style={{ color }}>
              {ch}
            </span>
          )
        })}
      </p>
      <input
        ref={inputRef}
        className="input"
        value={typed}
        onChange={onChange}
        disabled={done}
        placeholder="Start typing here…"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        style={{ fontFamily: 'monospace', fontSize: '1.05rem' }}
      />
      <p className="text-sm text-muted mt-2">
        Matched this line: {correctSoFar}/{prompt.length}
      </p>
    </div>
  )
}
