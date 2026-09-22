import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Lightbulb, Star } from '../ui/Icons'
import MiniQuiz from '../quiz/MiniQuiz'
import { useProgress } from '../../context/ProgressContext'
import { getAdjacentLessons } from '../../data/lessons'

/**
 * Reusable lesson viewer.
 * Props: lesson (full object with explanation, examples, keyPoints, tryIt, quiz)
 */
export default function LessonViewer({ lesson }) {
  const { completeLesson, isLessonCompleted } = useProgress()
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const { prev, next } = getAdjacentLessons(lesson?.id)

  // Reset ONLY when lesson id changes — do NOT depend on isLessonCompleted
  useEffect(() => {
    if (!lesson) return
    setStep(0)
    setCompleted(isLessonCompleted(lesson.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id])

  function handleQuizComplete(score, total) {
    if (!lesson) return
    const already = isLessonCompleted(lesson.id)
    completeLesson(lesson.id, score, total, already ? 0 : lesson.xp)
    setCompleted(true)
  }

  if (!lesson) return null

  return (
    <div>
      <div className="lesson-meta">
        <span className="badge badge-primary">Level {lesson.levelId}</span>
        <span className="badge badge-success">{lesson.duration}</span>
        <span className="badge badge-warning">+{lesson.xp} XP</span>
        {completed && (
          <span className="badge badge-success">
            <CheckCircle size={12} /> Completed
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>{lesson.title}</h2>

      {step === 0 && (
        <>
          <div className="card lesson-card">
            <h3 className="card-title mb-3">Simple Explanation</h3>
            {lesson.explanation.map((p, i) => (
              <p key={i} className="mb-3 text-sm" style={{ lineHeight: 1.6 }}>
                {p}
              </p>
            ))}
          </div>

          <div className="card lesson-card">
            <h3 className="card-title mb-3">Examples</h3>
            {lesson.examples.map((ex, i) => (
              <div key={i} className="mb-3">
                <p className="font-semibold text-sm">{ex.title}</p>
                <p className="text-sm text-muted">{ex.text}</p>
              </div>
            ))}
          </div>

          <div className="card lesson-card">
            <h3 className="card-title mb-2">Key Points</h3>
            <ul className="key-points">
              {lesson.keyPoints.map((kp, i) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>
          </div>

          <button type="button" className="btn btn-primary mt-2" onClick={() => setStep(1)}>
            Next: Try It Activity →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={20} color="#f59e0b" />
              <h3 className="card-title">{lesson.tryIt.title}</h3>
            </div>
            <p className="mb-3">{lesson.tryIt.instruction}</p>
            <details className="text-sm text-muted">
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Show hint</summary>
              <p className="mt-2">{lesson.tryIt.hint}</p>
            </details>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
              Next: Quick Quiz →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <MiniQuiz
            key={lesson.id}
            questions={lesson.quiz.questions}
            onComplete={handleQuizComplete}
          />
          <div className="flex gap-2 mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            {completed && (
              <button type="button" className="btn btn-primary" onClick={() => setStep(0)}>
                Review Lesson
              </button>
            )}
          </div>
          {completed && (
            <div className="card mt-4" style={{ background: '#d1fae5', borderColor: '#a7f3d0' }}>
              <div className="flex items-center gap-2">
                <Star size={20} color="#047857" />
                <span className="font-semibold" style={{ color: '#047857' }}>
                  Lesson completed!
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {(prev || next) && (
        <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {prev ? (
            <Link to={`/learn/${prev}`} className="btn btn-secondary btn-sm">
              ← Previous lesson
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/learn/${next}`} className="btn btn-primary btn-sm">
              Next lesson →
            </Link>
          ) : (
            <Link to="/learn" className="btn btn-secondary btn-sm">
              Back to levels
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
