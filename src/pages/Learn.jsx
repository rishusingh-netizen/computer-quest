import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LEVELS } from '../data/levels'
import { getLessonById, getLessonsForLevel } from '../data/lessons'
import LessonViewer from '../components/lesson/LessonViewer'
import { useProgress } from '../context/ProgressContext'
import { CheckCircle, Lock, BookOpen } from '../components/ui/Icons'

export default function Learn() {
  const { lessonId } = useParams()
  const { isLessonCompleted, completeLesson } = useProgress()
  const [activeLevel, setActiveLevel] = useState(1)

  const lesson = useMemo(() => (lessonId ? getLessonById(lessonId) : null), [lessonId])
  const levelLessons = useMemo(() => getLessonsForLevel(activeLevel), [activeLevel])

  if (lesson) {
    return (
      <LessonViewer
        lesson={lesson}
        completed={isLessonCompleted(lesson.id)}
        onComplete={(score, total, xp) => completeLesson(lesson.id, score, total, xp)}
      />
    )
  }

  return (
    <div>
      <h2 className="card-title mb-2">Learn</h2>
      <p className="text-sm text-muted mb-4">
        Work through levels at your own pace. Complete lessons to earn XP and unlock progress.
      </p>

      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {LEVELS.map((lv) => (
          <button
            key={lv.id}
            type="button"
            className={`btn btn-sm ${activeLevel === lv.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveLevel(lv.id)}
          >
            Level {lv.id}: {lv.title}
          </button>
        ))}
      </div>

      <div className="card mb-4">
        <h3 className="card-title">{LEVELS.find((l) => l.id === activeLevel)?.title}</h3>
        <p className="text-sm text-muted">
          {LEVELS.find((l) => l.id === activeLevel)?.description}
        </p>
      </div>

      <div className="grid-2">
        {levelLessons.length === 0 && (
          <div className="card">
            <p className="text-sm text-muted">Lessons for this level are being prepared.</p>
          </div>
        )}
        {levelLessons.map((lsn) => {
          const done = isLessonCompleted(lsn.id)
          return (
            <Link key={lsn.id} to={`/learn/${lsn.id}`} className="card" style={{ display: 'block' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle size={18} color="#10b981" />
                  ) : (
                    <BookOpen size={18} color="#4f46e5" />
                  )}
                  <span className="font-semibold">{lsn.title}</span>
                </div>
                {done && <span className="badge badge-success">Done</span>}
              </div>
              {lsn.summary && (
                <p className="text-sm text-muted mt-2">{lsn.summary}</p>
              )}
              <p className="text-sm mt-2">
                {lsn.estimatedMin || 5} min · {lsn.xpReward || 20} XP
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
