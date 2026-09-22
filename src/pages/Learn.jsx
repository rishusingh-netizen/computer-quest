import { Link, useParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Zap,
  Flame,
  Trophy,
  Target,
  FlaskConical,
  Gamepad2,
  ClipboardList,
  RefreshCw,
  Bot,
  Lock,
  ArrowRight,
} from '../components/ui/Icons'
import { LEVELS, getTotalLessons } from '../data/levels'
import { getLessonById, hasFullLesson } from '../data/lessons'
import LessonViewer from '../components/lesson/LessonViewer'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'
import { COURSE } from '../config/course'

function findNextLesson(completedLessons) {
  for (const lvl of LEVELS) {
    for (const lesson of lvl.lessons) {
      if (!completedLessons.includes(lesson.id)) {
        return { lesson, level: lvl }
      }
    }
  }
  return null
}

function lessonStatus(lessonId, completedLessons, prevLessonId) {
  if (completedLessons.includes(lessonId)) return 'completed'
  if (prevLessonId && !completedLessons.includes(prevLessonId)) return 'locked'
  if (completedLessons.length === 0 && !prevLessonId) return 'not_started'
  return 'not_started'
}

/** Collect real activity dates from progress (no invented days). */
function collectActivityDates(progress) {
  const days = new Set()
  if (progress.lastActiveDate) days.add(String(progress.lastActiveDate).slice(0, 10))
  const buckets = [
    progress.lessonScores,
    progress.practiceScores,
    progress.testScores,
    progress.revisionScores,
  ]
  for (const bucket of buckets) {
    if (!bucket || typeof bucket !== 'object') continue
    for (const entry of Object.values(bucket)) {
      if (entry?.date) days.add(String(entry.date).slice(0, 10))
      if (Array.isArray(entry?.history)) {
        for (const h of entry.history) {
          if (h?.date) days.add(String(h.date).slice(0, 10))
        }
      }
    }
  }
  return days
}

function WeeklyActivity({ progress }) {
  const activeDays = collectActivityDates(progress)
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const cells = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const weekday = (d.getDay() + 6) % 7
    cells.push({
      iso,
      label: labels[weekday],
      active: activeDays.has(iso),
      isToday: i === 0,
    })
  }

  return (
    <div className="card learn-weekly">
      <div className="card-header">
        <h3 className="card-title">Weekly Activity</h3>
        <span className="text-sm text-muted">
          {progress.streak > 0 ? `${progress.streak}-day streak` : 'Start a streak today'}
        </span>
      </div>
      <div className="weekly-row" role="list" aria-label="Activity in the last 7 days">
        {cells.map((c) => (
          <div
            key={c.iso}
            className={`weekly-day ${c.active ? 'active' : ''} ${c.isToday ? 'today' : ''}`}
            role="listitem"
            title={`${c.iso}${c.active ? ' — active' : ''}`}
          >
            <span className="weekly-label">{c.label}</span>
            <span className="weekly-dot" aria-hidden="true">
              {c.active ? '✓' : '•'}
            </span>
            <span className="sr-only">
              {c.iso}: {c.active ? 'active' : 'no activity recorded'}
            </span>
          </div>
        ))}
      </div>
      {activeDays.size === 0 && (
        <p className="text-sm text-muted mt-2">
          Complete a lesson or practice session to mark today active.
        </p>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'completed') {
    return <span className="badge badge-success">Completed</span>
  }
  if (status === 'locked') {
    return <span className="badge learn-badge-locked">Locked</span>
  }
  if (status === 'in_progress') {
    return <span className="badge badge-warning">In Progress</span>
  }
  return <span className="badge learn-badge-idle">Not Started</span>
}

export default function Learn() {
  const { lessonId } = useParams()
  const progress = useProgress()
  const {
    isLessonCompleted,
    completedLessons,
    xp,
    level,
    streak,
    lessonsCompletedCount,
    progressPercent,
    totalLessons,
  } = progress
  const { user } = useAuth()
  const firstName = (user?.name || 'Student').split(' ')[0]

  if (lessonId) {
    const lesson = getLessonById(lessonId)

    if (lesson) {
      return (
        <div>
          <div className="mb-4">
            <Link to="/learn" className="btn btn-ghost btn-sm">
              ← Learning dashboard
            </Link>
          </div>
          <LessonViewer lesson={lesson} />
        </div>
      )
    }

    return (
      <div>
        <div className="mb-4">
          <Link to="/learn" className="btn btn-ghost btn-sm">
            ← Learning dashboard
          </Link>
        </div>
        <div className="card page-placeholder">
          <div className="icon-wrap">
            <BookOpen size={28} />
          </div>
          <h2>Lesson coming soon</h2>
          <p>
            Full interactive content for this lesson will be added in a later phase. Levels 1–3
            (Basics, Typing, Microsoft Office) are fully available now.
          </p>
          <Link to="/learn" className="btn btn-primary">
            Back to Learn
          </Link>
        </div>
      </div>
    )
  }

  const next = findNextLesson(completedLessons)
  const allDone = lessonsCompletedCount >= getTotalLessons()
  const continueLesson = next?.lesson
  const continueLevel = next?.level
  const fullContinue = continueLesson ? getLessonById(continueLesson.id) : null
  const shortDesc =
    fullContinue?.explanation?.[0] ||
    continueLevel?.description ||
    'Open this lesson to keep building your computer skills.'

  return (
    <div className="learn-dashboard">
      <div className="learn-welcome mb-4">
        <div>
          <h2 className="learn-hello">Welcome back, {firstName}!</h2>
          <p className="text-muted text-sm mt-1">
            Pick up where you left off — or explore a new level.
          </p>
        </div>
        <div className="learn-stat-row">
          <div className="learn-stat">
            <Trophy size={16} aria-hidden="true" />
            <span>
              Level <strong>{level}</strong>
            </span>
          </div>
          <div className="learn-stat">
            <Zap size={16} aria-hidden="true" />
            <span>
              <strong>{xp}</strong> XP
            </span>
          </div>
          <div className="learn-stat">
            <Flame size={16} aria-hidden="true" />
            <span>
              <strong>{streak}</strong> day streak
            </span>
          </div>
          <div className="learn-stat">
            <Target size={16} aria-hidden="true" />
            <span>
              <strong>{progressPercent}%</strong> course
            </span>
          </div>
        </div>
      </div>

      <div className="card learn-continue mb-4">
        <div className="learn-continue-body">
          <div>
            <p className="text-sm text-muted mb-1">
              {allDone ? 'Course complete' : lessonsCompletedCount === 0 ? 'Get started' : 'Continue learning'}
            </p>
            {allDone ? (
              <>
                <h3 className="card-title">You finished every lesson</h3>
                <p className="text-sm text-muted mt-1">
                  Great work. Review weak topics, take tests, or explore Practice Lab and Game Zone.
                </p>
              </>
            ) : (
              <>
                <h3 className="card-title">
                  {continueLesson?.title || 'Start your first lesson'}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {COURSE.name}
                  {continueLevel ? ` · Level ${continueLevel.id}: ${continueLevel.title}` : ''}
                  {continueLesson?.duration ? ` · ${continueLesson.duration}` : ''}
                  {continueLesson?.xp != null ? ` · +${continueLesson.xp} XP` : ''}
                </p>
                <p className="text-sm mt-2 learn-continue-desc">{shortDesc}</p>
              </>
            )}
          </div>
          <div className="learn-continue-actions">
            {allDone ? (
              <Link to="/completion" className="btn btn-primary">
                View completion <ArrowRight size={16} />
              </Link>
            ) : continueLesson ? (
              <Link to={`/learn/${continueLesson.id}`} className="btn btn-primary">
                {lessonsCompletedCount === 0 ? 'Start Learning' : 'Continue Learning'}{' '}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/learn" className="btn btn-primary">
                Browse levels
              </Link>
            )}
          </div>
        </div>
        {!allDone && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted">Lesson progress</span>
              <span className="font-semibold">
                {lessonsCompletedCount} / {totalLessons || getTotalLessons()}
              </span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="learn-grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Progress</h3>
            <span className="badge badge-primary">{progressPercent}%</span>
          </div>
          <div className="progress-bar mb-3" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <ul className="learn-progress-list">
            <li>
              <span className="text-muted">Lessons completed</span>
              <strong>
                {lessonsCompletedCount} of {totalLessons || getTotalLessons()}
              </strong>
            </li>
            <li>
              <span className="text-muted">XP earned</span>
              <strong>{xp}</strong>
            </li>
            <li>
              <span className="text-muted">Current level</span>
              <strong>{level}</strong>
            </li>
            <li>
              <span className="text-muted">Current streak</span>
              <strong>
                {streak} day{streak !== 1 ? 's' : ''}
              </strong>
            </li>
          </ul>
          {lessonsCompletedCount === 0 && (
            <p className="text-sm text-muted mt-2">
              No progress yet — start with Level 1 to earn your first XP.
            </p>
          )}
        </div>

        <WeeklyActivity progress={progress} />
      </div>

      <div className="mb-4">
        <h3 className="card-title mb-3">Quick Practice</h3>
        <div className="learn-quick-grid">
          <Link to="/practice" className="card learn-quick-card">
            <FlaskConical size={22} color="#4f46e5" aria-hidden="true" />
            <span className="font-semibold">Practice Lab</span>
            <span className="text-sm text-muted">Hands-on simulations</span>
          </Link>
          <Link to="/games" className="card learn-quick-card">
            <Gamepad2 size={22} color="#0ea5e9" aria-hidden="true" />
            <span className="font-semibold">Game Zone</span>
            <span className="text-sm text-muted">Learn by playing</span>
          </Link>
          <Link to="/tests" className="card learn-quick-card">
            <ClipboardList size={22} color="#10b981" aria-hidden="true" />
            <span className="font-semibold">Tests</span>
            <span className="text-sm text-muted">Level quizzes</span>
          </Link>
          <Link to="/revision" className="card learn-quick-card">
            <RefreshCw size={22} color="#f59e0b" aria-hidden="true" />
            <span className="font-semibold">Revision</span>
            <span className="text-sm text-muted">Weak topics</span>
          </Link>
          <Link to="/ai-tutor" className="card learn-quick-card">
            <Bot size={22} color="#8b5cf6" aria-hidden="true" />
            <span className="font-semibold">AI Tutor</span>
            <span className="text-sm text-muted">Quest Helper</span>
          </Link>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="card-title mb-1">Course structure</h3>
        <p className="text-sm text-muted mb-3">
          {COURSE.name} · {LEVELS.length} levels · {getTotalLessons()} lessons
        </p>
      </div>

      <div className="learn-levels">
        {LEVELS.map((lvl) => {
          const done = lvl.lessons.filter((l) => completedLessons.includes(l.id)).length
          const total = lvl.lessons.length
          const pct = total ? Math.round((done / total) * 100) : 0
          const hasFullContent = lvl.lessons.some((l) => hasFullLesson(l.id))

          return (
            <div key={lvl.id} className="card learn-level-card">
              <div className="learn-level-head">
                <div className="flex items-center gap-3">
                  <div
                    className="learn-level-badge"
                    style={{ background: `${lvl.color}22`, color: lvl.color }}
                    aria-hidden="true"
                  >
                    L{lvl.id}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Level {lvl.id}: {lvl.title}
                      {hasFullContent && (
                        <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 10 }}>
                          Interactive
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted">{lvl.description}</p>
                  </div>
                </div>
                <span className="badge badge-primary">
                  {done}/{total} · {pct}%
                </span>
              </div>

              <div className="progress-bar mb-3">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>

              <div className="learn-lesson-list">
                {lvl.lessons.map((lesson, idx) => {
                  const prevId = idx > 0 ? lvl.lessons[idx - 1].id : null
                  const status = lessonStatus(lesson.id, completedLessons, prevId)
                  const doneLesson = status === 'completed'
                  const full = hasFullLesson(lesson.id)

                  return (
                    <Link
                      key={lesson.id}
                      to={`/learn/${lesson.id}`}
                      className={`learn-lesson-row ${doneLesson ? 'done' : ''} ${status === 'locked' ? 'locked' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {doneLesson ? (
                          <CheckCircle size={16} color="#10b981" aria-hidden="true" />
                        ) : status === 'locked' ? (
                          <Lock size={16} color="#94a3b8" aria-hidden="true" />
                        ) : (
                          <BookOpen size={16} color="#64748b" aria-hidden="true" />
                        )}
                        <span className="text-sm font-semibold">{lesson.title}</span>
                        {full && (
                          <span className="badge badge-success" style={{ fontSize: 10 }}>
                            Full
                          </span>
                        )}
                      </div>
                      <div className="learn-lesson-meta">
                        <StatusBadge status={status} />
                        <span className="text-sm text-muted">{lesson.duration}</span>
                        <span className="text-sm text-muted">+{lesson.xp} XP</span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
