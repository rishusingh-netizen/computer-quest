import { useState } from 'react'

const SCENARIOS = [
  {
    text: 'SMS: Your bank account will close in 1 hour. Click http://bit.ly/bank-secure-now to verify.',
    safe: false,
    why: 'Urgent threat + short suspicious link is a common scam pattern.',
  },
  {
    text: 'Email from your school domain: Reminder — submit the assignment on the official portal by Friday.',
    safe: true,
    why: 'Known sender context and no pressure to click a strange link.',
  },
  {
    text: 'Popup: Your PC is infected! Call +1-555-0199 immediately and install this cleaner.',
    safe: false,
    why: 'Fear + unknown phone number + forced install is malware social engineering.',
  },
  {
    text: 'Colleague chat: Sharing the meeting notes link on our company SharePoint.',
    safe: true,
    why: 'Normal workplace sharing on a known platform.',
  },
]

export default function PhishingPractice({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')
  const s = SCENARIOS[index]

  function answer(isSafe) {
    if (done) return
    const correct = isSafe === s.safe
    const nextScore = score + (correct ? 1 : 0)
    setScore(nextScore)
    setFeedback((correct ? '✓ Correct. ' : '✗ Not quite. ') + s.why)
    setDone(true)
    if (index + 1 >= SCENARIOS.length) {
      // finished after feedback
    }
  }

  function next() {
    if (index + 1 >= SCENARIOS.length) {
      onComplete?.(score, SCENARIOS.length)
      return
    }
    setIndex((i) => i + 1)
    setDone(false)
    setFeedback('')
  }

  // Fix: use score after last answer
  function finish() {
    onComplete?.(score, SCENARIOS.length)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Scenario {index + 1} / {SCENARIOS.length}
        </span>
        <span className="badge badge-primary">{score} correct</span>
      </div>
      <p className="mb-4" style={{ lineHeight: 1.5 }}>
        {s.text}
      </p>
      {!done ? (
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary" onClick={() => answer(true)}>
            Looks safe
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => answer(false)}>
            Phishing / scam
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm mb-3">{feedback}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => (index + 1 >= SCENARIOS.length ? finish() : next())}
          >
            {index + 1 >= SCENARIOS.length ? `Done — score ${score}/${SCENARIOS.length}` : 'Next →'}
          </button>
        </>
      )}
    </div>
  )
}
