import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../context/ProgressContext'

export default function TestRunner({ test }) {
  const { recordTest } = useProgress()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const questions = test.questions?.length ? test.questions : Array.from({ length: test.questionCount || 5 }, (_, i) => ({
    id: i,
    text: `Sample question ${i + 1} for ${test.title}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 0,
  }))
  const [answers, setAnswers] = useState({})

  function submit() {
    let score = 0
    questions.forEach((q, i) => {
      if (answers[i] === (q.correct ?? 0)) score++
    })
    const total = questions.length
    const passed = (score / total) * 100 >= (test.passPercent || 60)
    recordTest(test.id, score, total, {
      xpReward: test.xpReward || 40,
      passed,
      weakTopics: [],
    })
    setFinished(true)
  }

  if (!started) {
    return (
      <div className="card">
        <h2 className="card-title">{test.title}</h2>
        <p className="text-sm text-muted">{test.description}</p>
        <p className="text-sm mt-2">{test.questionCount} questions · Pass {test.passPercent}% · +{test.xpReward} XP</p>
        <button type="button" className="btn btn-primary mt-3" onClick={() => setStarted(true)}>Start test</button>
        <Link to="/tests" className="btn btn-secondary mt-3" style={{ marginLeft: 8 }}>Back</Link>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="card">
        <h2 className="card-title">Test complete</h2>
        <p className="text-sm">Your results have been saved to progress.</p>
        <Link to="/tests" className="btn btn-primary mt-3">All tests</Link>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="card-title mb-3">{test.title}</h2>
      {questions.map((q, i) => (
        <div key={q.id ?? i} className="mb-4">
          <p className="font-semibold mb-2">{i + 1}. {q.text}</p>
          {(q.options || []).map((opt, oi) => (
            <button
              key={oi}
              type="button"
              className={`quiz-option ${answers[i] === oi ? 'selected' : ''}`}
              onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
            >
              {opt}
            </button>
          ))}
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={submit}>Submit test</button>
    </div>
  )
}
