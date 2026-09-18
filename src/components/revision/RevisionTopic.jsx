import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RevisionTopic({ topic, onComplete }) {
  const [done, setDone] = useState(false)

  if (!topic) return <div className="card">Topic not found</div>

  function finish() {
    setDone(true)
    onComplete?.(8, 10, 15)
  }

  return (
    <div>
      <Link to="/revision" className="text-sm" style={{ color: 'var(--cq-primary)' }}>← All topics</Link>
      <div className="card mt-3">
        <h2 className="card-title">{topic.title}</h2>
        <p className="text-sm text-muted mb-3">{topic.description}</p>
        <p className="text-sm mb-3">Review the key ideas for this topic, then mark complete.</p>
        {done ? (
          <p className="badge badge-success">Completed</p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finish}>Mark revision complete</button>
        )}
      </div>
    </div>
  )
}
