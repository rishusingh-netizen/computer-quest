import { useState, useMemo, useRef } from 'react'

const EMAILS = [
  {
    id: 1,
    from: 'support@paypa1-secure.com',
    subject: 'URGENT: Your account will be closed in 24 hours',
    body: 'Click here immediately and enter your password to verify your identity or we will suspend your account.',
    phishing: true,
    explain: 'Fake domain (paypa1), urgent threat, asks for password — classic phishing.',
  },
  {
    id: 2,
    from: 'teacher@school.edu',
    subject: 'Homework reminder for Monday',
    body: 'Please submit your computer skills assignment by Monday 9 AM. Reply if you have questions.',
    phishing: false,
    explain: 'Known school domain, normal request, no links asking for secrets.',
  },
  {
    id: 3,
    from: 'prize@winner-notify.xyz',
    subject: 'You won a free iPhone!!!',
    body: 'Claim your prize now by paying a small shipping fee of $2.99. Send your card details here.',
    phishing: true,
    explain: 'Unexpected prize + asks for payment/card details is a scam.',
  },
  {
    id: 4,
    from: 'noreply@github.com',
    subject: 'Security alert: new sign-in',
    body: 'We noticed a new sign-in to your account. If this was you, no action is needed. Review activity in your settings on github.com.',
    phishing: false,
    explain: 'Legitimate style notice; points you to the real site, does not ask for password in email.',
  },
  {
    id: 5,
    from: 'bank@secure-login-update.com',
    subject: 'Confirm your PIN',
    body: 'Dear customer, reply with your ATM PIN to confirm your account or it will be locked today.',
    phishing: true,
    explain: 'Banks never ask for PIN by email. Urgent lock threat is a red flag.',
  },
  {
    id: 6,
    from: 'friend@gmail.com',
    subject: 'Photos from the trip',
    body: 'Hey! Sharing the album link we talked about yesterday. Let me know which ones you like.',
    phishing: false,
    explain: 'Personal context from a known contact without money or password requests.',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PhishingSpotter({ onFinish }) {
  const list = useMemo(() => shuffle(EMAILS), [])
  const [index, setIndex] = useState(0)
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const email = list[index]

  function answer(isPhishingGuess) {
    if (feedback) return
    const ok = isPhishingGuess === email.phishing
    if (ok) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
    setFeedback(ok ? 'correct' : 'wrong')
  }

  function next() {
    if (index + 1 >= list.length) {
      onFinish(scoreRef.current * 15, {
        detail: `${scoreRef.current}/${list.length} correct`,
      })
      return
    }
    setIndex((i) => i + 1)
    setFeedback(null)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          Message {index + 1} / {list.length}
        </span>
        <span className="badge badge-primary">{score} correct</span>
      </div>

      <div className="phish-email">
        <p className="text-sm">
          <strong>From:</strong> {email.from}
        </p>
        <p className="text-sm">
          <strong>Subject:</strong> {email.subject}
        </p>
        <p className="mt-2">{email.body}</p>
      </div>

      {!feedback && (
        <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => answer(false)}>
            ✓ Looks Safe
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => answer(true)}>
            ⚠ Phishing / Scam
          </button>
        </div>
      )}

      {feedback && (
        <>
          <div
            className="mt-3 text-sm"
            style={{
              padding: 12,
              borderRadius: 8,
              background: feedback === 'correct' ? '#d1fae5' : '#fee2e2',
            }}
          >
            {feedback === 'correct' ? '✓ Correct! ' : '✗ Not quite. '}
            {email.explain}
          </div>
          <button type="button" className="btn btn-primary mt-4" onClick={next}>
            {index + 1 >= list.length ? 'Finish' : 'Next Message →'}
          </button>
        </>
      )}
    </div>
  )
}
