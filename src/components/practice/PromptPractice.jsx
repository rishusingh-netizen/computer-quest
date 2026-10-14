import { useState } from 'react'

export default function PromptPractice({ onComplete }) {
  const [prompt, setPrompt] = useState('')
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')

  function evaluate(p) {
    let score = 0
    const t = p.trim()
    if (t.length >= 20) score += 40
    if (/\b(write|explain|list|summarize|create|help)\b/i.test(t)) score += 20
    if (/\b(for|because|so that|with|using)\b/i.test(t)) score += 20
    if (t.split(/\s+/).length >= 8) score += 20
    return Math.min(100, score)
  }

  function submit() {
    const score = evaluate(prompt)
    if (score < 60) {
      setMsg('Make the prompt clearer: state the task, add context, and aim for 8+ words.')
      return
    }
    setMsg(`✓ Solid prompt (score ${score}/100).`)
    setDone(true)
    onComplete?.(score, 100)
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">Write a clear AI prompt</h3>
      <p className="text-sm text-muted mb-3">
        Example goal: ask an AI to explain CPU vs RAM for a beginner in simple English.
      </p>
      <textarea
        className="input mb-3"
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Explain the difference between CPU and RAM for a beginner, using a simple analogy..."
      />
      {!done && (
        <button type="button" className="btn btn-primary" onClick={submit}>
          Check prompt
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
