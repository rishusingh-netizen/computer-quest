import { useState, useRef } from 'react'
import { CheckCircle, XCircle } from '../ui/Icons'

/**
 * Reusable mini-quiz component.
 * Props:
 *  - questions: array of { id, question, options, correctIndex, explanation }
 *  - onComplete: (score, total) => void
 *
 * Score is tracked in a ref as well as state so the final score never depends on a
 * stale React state value after the last answer is checked (setState is async).
 */
export default function MiniQuiz({ questions = [], onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  // Synchronous score — always matches the number of correct checks so far
  const scoreRef = useRef(0)

  if (!questions.length) {
    return <p className="text-muted">No questions available.</p>
  }

  const q = questions[current]
  const isLast = current === questions.length - 1

  function handleSelect(idx) {
    if (showResult) return
    setSelected(idx)
  }

  function handleCheck() {
    if (selected === null) return
    const correct = selected === q.correctIndex
    if (correct) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setShowResult(true)
  }

  function handleNext() {
    if (isLast) {
      // Use ref (already includes last answer) — never read stale `score` state here
      const final = scoreRef.current
      setFinalScore(final)
      setFinished(true)
      if (onComplete) onComplete(final, questions.length)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  if (finished) {
    const pct = Math.round((finalScore / questions.length) * 100)
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
        <h3 className="card-title">Quiz Complete!</h3>
        <p className="mt-2">
          You scored <strong>{finalScore}</strong> out of <strong>{questions.length}</strong> ({pct}%)
        </p>
        <p className="text-sm text-muted mt-2">
          {pct >= 80
            ? 'Excellent work!'
            : pct >= 50
              ? 'Good effort – review the key points.'
              : 'Review the lesson and try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Quick Quiz · {current + 1}/{questions.length}
        </span>
        <span className="badge badge-primary">{score} correct</span>
      </div>

      <p className="font-semibold mb-3">{q.question}</p>

      {q.options.map((opt, idx) => {
        let cls = 'quiz-option'
        if (selected === idx) cls += ' selected'
        if (showResult) {
          if (idx === q.correctIndex) cls += ' correct'
          else if (idx === selected && idx !== q.correctIndex) cls += ' wrong'
        }
        return (
          <button
            key={idx}
            type="button"
            className={cls}
            onClick={() => handleSelect(idx)}
            disabled={showResult}
          >
            {opt}
          </button>
        )
      })}

      {showResult && (
        <div
          className="mt-3 text-sm"
          style={{
            padding: '12px',
            borderRadius: 8,
            background: selected === q.correctIndex ? '#d1fae5' : '#fee2e2',
          }}
        >
          {selected === q.correctIndex ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#047857" /> Correct!
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={16} color="#b91c1c" /> Incorrect.
            </span>
          )}
          <p className="mt-1">{q.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!showResult ? (
          <button
            className="btn btn-primary"
            onClick={handleCheck}
            disabled={selected === null}
          >
            Check Answer
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  )
}
