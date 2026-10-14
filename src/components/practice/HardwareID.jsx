import { useState, useMemo, useRef } from 'react'

const COMPONENTS = [
  { id: 'cpu', name: 'CPU', desc: 'Brain of the computer — processes instructions', emoji: '🧠' },
  { id: 'ram', name: 'RAM', desc: 'Temporary fast memory while programs run', emoji: '⚡' },
  { id: 'hdd', name: 'HDD', desc: 'Hard disk drive — stores data permanently (slower)', emoji: '💾' },
  { id: 'ssd', name: 'SSD', desc: 'Solid state drive — fast permanent storage', emoji: '🚀' },
  { id: 'keyboard', name: 'Keyboard', desc: 'Input device for typing', emoji: '⌨️' },
  { id: 'mouse', name: 'Mouse', desc: 'Pointing and clicking input device', emoji: '🖱️' },
  { id: 'monitor', name: 'Monitor', desc: 'Display / output screen', emoji: '🖥️' },
  { id: 'printer', name: 'Printer', desc: 'Outputs documents on paper', emoji: '🖨️' },
]

const QUESTIONS = [
  { prompt: 'Which component is the “brain” of the computer?', answer: 'cpu' },
  { prompt: 'Which memory is temporary and clears when you shut down?', answer: 'ram' },
  { prompt: 'Which storage is usually faster: HDD or SSD?', answer: 'ssd' },
  { prompt: 'Which device do you use to type text?', answer: 'keyboard' },
  { prompt: 'Which device shows pictures and text on screen?', answer: 'monitor' },
  { prompt: 'Which device prints documents on paper?', answer: 'printer' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HardwareID({ onComplete }) {
  const questions = useMemo(() => shuffle(QUESTIONS).slice(0, 5), [])
  const [index, setIndex] = useState(0)
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const q = questions[index]
  const options = useMemo(() => {
    const correct = COMPONENTS.find((c) => c.id === q.answer)
    const others = shuffle(COMPONENTS.filter((c) => c.id !== q.answer)).slice(0, 3)
    return shuffle([correct, ...others])
  }, [q])

  function handleSelect(id) {
    if (showResult) return
    setSelected(id)
    if (id === q.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setShowResult(true)
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      onComplete(scoreRef.current, questions.length)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setShowResult(false)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Question {index + 1} / {questions.length}
        </span>
        <span className="badge badge-primary">{score} correct</span>
      </div>

      <p className="font-semibold mb-4" style={{ fontSize: '1.1rem' }}>
        {q.prompt}
      </p>

      <div className="hw-grid">
        {options.map((c) => {
          let cls = 'hw-card'
          if (showResult) {
            if (c.id === q.answer) cls += ' hw-correct'
            else if (c.id === selected) cls += ' hw-wrong'
          }
          return (
            <button
              key={c.id}
              type="button"
              className={cls}
              disabled={showResult}
              onClick={() => handleSelect(c.id)}
            >
              <span className="hw-emoji">{c.emoji}</span>
              <span className="hw-name">{c.name}</span>
              <span className="hw-desc text-sm text-muted">{c.desc}</span>
            </button>
          )
        })}
      </div>

      {showResult && (
        <>
          <div
            className="mt-3 text-sm"
            style={{
              padding: 12,
              borderRadius: 8,
              background: selected === q.answer ? '#d1fae5' : '#fee2e2',
            }}
          >
            {selected === q.answer
              ? '✓ Correct!'
              : `✗ Incorrect. The answer is ${COMPONENTS.find((c) => c.id === q.answer)?.name}.`}
          </div>
          <button type="button" className="btn btn-primary mt-4" onClick={handleNext}>
            {index + 1 >= questions.length ? 'Finish' : 'Next Question →'}
          </button>
        </>
      )}
    </div>
  )
}
