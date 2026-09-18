import { useState } from 'react'

export default function MiniQuiz({ questions = [], onComplete }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (!questions.length) {
    return <p className="text-sm text-muted">No questions.</p>
  }

  const q = questions[index]

  function answer(oi) {
    const correct = oi === (q.correct ?? 0)
    const nextScore = score + (correct ? 1 : 0)
    if (index + 1 >= questions.length) {
      setScore(nextScore)
      setDone(true)
      onComplete?.(nextScore, questions.length)
    } else {
      setScore(nextScore)
      setIndex(index + 1)
    }
  }

  if (done) {
    return (
      <div>
        <p className="font-semibold">Score: {score}/{questions.length}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted mb-2">Question {index + 1} of {questions.length}</p>
      <p className="font-semibold mb-2">{q.text}</p>
      {(q.options || []).map((opt, oi) => (
        <button key={oi} type="button" className="quiz-option" onClick={() => answer(oi)}>{opt}</button>
      ))}
    </div>
  )
}
