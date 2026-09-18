import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from '../ui/Icons'

export default function LessonViewer({ lesson, completed, onComplete }) {
  const [done, setDone] = useState(!!completed)

  if (!lesson) {
    return (
      <div className="card">
        <p>Lesson not found.</p>
        <Link to="/learn" className="btn btn-secondary mt-3">Back to Learn</Link>
      </div>
    )
  }

  function handleComplete() {
    setDone(true)
    onComplete?.(10, 10, lesson.xpReward || 20)
  }

  return (
    <div>
      <Link to="/learn" className="text-sm" style={{ color: 'var(--cq-primary)' }}>← All lessons</Link>
      <div className="card mt-3">
        <h2 className="card-title">{lesson.title}</h2>
        {lesson.summary && <p className="text-sm text-muted mb-3">{lesson.summary}</p>}
        <div className="text-sm" style={{ lineHeight: 1.7 }}>
          {lesson.content ? (
            <div dangerouslySetInnerHTML={{ __html: typeof lesson.content === 'string' ? lesson.content : '' }} />
          ) : (
            <p>Lesson content for <strong>{lesson.title}</strong>. Full interactive content is available in the complete local curriculum data.</p>
          )}
        </div>
        {lesson.keyPoints?.length > 0 && (
          <ul className="key-points mt-3">
            {lesson.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        )}
        <div className="mt-4">
          {done ? (
            <span className="badge badge-success"><CheckCircle size={14} /> Completed</span>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleComplete}>Mark as complete</button>
          )}
        </div>
      </div>
    </div>
  )
}
