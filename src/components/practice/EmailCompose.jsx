import { useState, useRef } from 'react'

/** Simulated email compose — does not send real email. */
export default function EmailCompose({ onComplete }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)

  function evaluate() {
    let s = 0
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) s += 40
    if (subject.trim().length >= 3) s += 30
    if (body.trim().length >= 20) s += 30
    return s
  }

  function handleSend() {
    const s = evaluate()
    scoreRef.current = s
    if (s < 100) {
      setMsg('Fill a valid To address, a subject, and a message of at least 20 characters.')
      return
    }
    setMsg('✓ Email ready (simulated — not sent).')
    setDone(true)
    onComplete?.(s, 100)
  }

  return (
    <div className="card">
      <h3 className="card-title mb-3">Compose email (simulation)</h3>
      <label className="text-sm">To</label>
      <input className="input mb-2" value={to} onChange={(e) => setTo(e.target.value)} placeholder="friend@example.com" />
      <label className="text-sm">Subject</label>
      <input className="input mb-2" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hello" />
      <label className="text-sm">Message</label>
      <textarea
        className="input mb-3"
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a short polite message..."
      />
      {!done && (
        <button type="button" className="btn btn-primary" onClick={handleSend}>
          Send (simulate)
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
      <p className="text-sm text-muted mt-3">Does not send a real email.</p>
    </div>
  )
}
