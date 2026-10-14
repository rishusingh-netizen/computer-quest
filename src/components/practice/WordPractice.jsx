import { useState, useRef } from 'react'

/** Simulated Word-style editor — does not control real MS Word. */
export default function WordPractice({ onComplete }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [bold, setBold] = useState(false)
  const [done, setDone] = useState(false)
  const [checks, setChecks] = useState({ title: false, body: false, bold: false, length: false, save: false })
  const scoreRef = useRef(0)

  function runChecks(saved = false) {
    const c = {
      title: title.trim().length >= 3,
      body: body.trim().length >= 30,
      bold: bold,
      length: body.trim().split(/\s+/).filter(Boolean).length >= 8,
      save: saved || checks.save,
    }
    setChecks(c)
    return c
  }

  function handleSave() {
    const c = runChecks(true)
    c.save = true
    setChecks(c)
    const score = Object.values(c).filter(Boolean).length
    scoreRef.current = score
    if (score >= 4) {
      setDone(true)
      onComplete?.(score, 5)
    }
  }

  const doneCount = Object.values(checks).filter(Boolean).length

  return (
    <div className="card">
      <h3 className="card-title mb-2">Word document practice (simulation)</h3>
      <p className="text-sm text-muted mb-3">
        Complete the checklist. This is an in-browser simulation — it does not open real Microsoft Word.
      </p>
      <div className="flex gap-2 mb-2">
        <button type="button" className={`btn btn-sm ${bold ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setBold((b) => !b)}>
          Bold
        </button>
        <button type="button" className="btn btn-sm btn-secondary" onClick={handleSave}>
          Save document
        </button>
      </div>
      <input
        className="input mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        style={{ fontWeight: bold ? 700 : 400 }}
      />
      <textarea
        className="input mb-3"
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write at least a few sentences about why computers are useful..."
        style={{ fontWeight: bold ? 700 : 400 }}
      />
      <ul className="text-sm mb-3">
        <li>{checks.title ? '✓' : '○'} Title (3+ characters)</li>
        <li>{checks.body ? '✓' : '○'} Body (30+ characters)</li>
        <li>{checks.length ? '✓' : '○'} At least 8 words</li>
        <li>{checks.bold ? '✓' : '○'} Bold applied</li>
        <li>{checks.save ? '✓' : '○'} Saved</li>
      </ul>
      {!done && (
        <button type="button" className="btn btn-primary" onClick={() => handleSave()}>
          Finish practice ({doneCount}/5)
        </button>
      )}
      {done && <p className="text-sm mt-2">Complete — score {doneCount}/5</p>}
    </div>
  )
}
