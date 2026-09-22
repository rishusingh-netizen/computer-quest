import { Link } from 'react-router-dom'
import {
  BookOpen,
  Zap,
  Flame,
  Target,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from '../components/ui/Icons'
import { useProgress } from '../context/ProgressContext'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { COURSE } from '../config/course'
import { evaluateCompletion } from '../services/completion'
import { api } from '../services/api'
import { LEVELS, getTotalLessons } from '../data/levels'

export default function Dashboard() {
  const progress = useProgress()
  const {
    xp,
    level,
    streak,
    lessonsCompletedCount,
    progressPercent,
    completedLessons,
    weakTopics,
  } = progress
  const { hasAccess, accessDaysLeft, isLoggedIn, user } = useAuth()
  const membership = user?.membership
  const completion = evaluateCompletion(progress)
  const [certificate, setCertificate] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!user) {
      setCertificate(null)
      return
    }
    ;(async () => {
      const res = await api.myCertificate()
      if (!cancelled && res.ok) setCertificate(res.certificate || null)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  // Recommend next incomplete lesson across levels
  let nextLesson = null
  let nextLevelTitle = ''
  for (const lvl of LEVELS) {
    const found = lvl.lessons.find((l) => !completedLessons.includes(l.id))
    if (found) {
      nextLesson = found
      nextLevelTitle = lvl.title
      break
    }
  }
  if (!nextLesson) {
    nextLesson = LEVELS[0].lessons[0]
    nextLevelTitle = LEVELS[0].title
  }

  const todayMission = nextLesson
    ? `Complete “${nextLesson.title}” in ${nextLevelTitle}`
    : 'Explore the Practice Lab or Game Zone'

  const topWeak = (weakTopics || []).slice(0, 3)

  const firstName = (user?.name || 'Student').split(' ')[0]

  return (
    <div>
      {/* Welcome */}
      <div className="card welcome-card mb-4">
        <h2>Welcome back, {firstName}! 👋</h2>
        <p>
          Learn computer skills step by step — from basics to advanced. Follow the path:{' '}
          <strong>Learn → Practice → Play → Test → Revise → Progress</strong>.
        </p>
      </div>


      {isLoggedIn && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">{COURSE.name} Access</h3>
          </div>
          {hasAccess ? (
            <p className="text-sm">
              <span className="badge badge-success">Active</span>
              {' '}{accessDaysLeft != null ? accessDaysLeft : '—'} days remaining
              {membership?.expiresAt && (
                <> · Expires {new Date(membership.expiresAt).toLocaleDateString('en-IN')}</>
              )}
            </p>
          ) : (
            <p className="text-sm">
              No active membership.{' '}
              <Link to="/course">Enroll now</Link>
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid-4 mb-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Zap size={20} />
          </div>
          <div className="stat-value">{xp}</div>
          <div className="stat-label">XP Points</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Flame size={20} />
          </div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#047857' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value">
            {lessonsCompletedCount}/{getTotalLessons()}
          </div>
          <div className="stat-label">Lessons Done</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-value">{level}</div>
          <div className="stat-label">Your Level</div>
        </div>
      </div>

      {/* Progress + Mission */}
      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Overall Progress</h3>
            <span className="badge badge-primary">{progressPercent}%</span>
          </div>
          <div className="progress-bar mb-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted">
            {lessonsCompletedCount} of {getTotalLessons()} lessons completed across 9 levels.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Today’s Mission</h3>
            <Target size={18} color="#4f46e5" />
          </div>
          <p className="mb-3 text-sm">{todayMission}</p>
          <Link
            to={nextLesson ? `/learn/${nextLesson.id}` : '/learn'}
            className="btn btn-primary btn-sm"
          >
            Continue Learning <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recommended */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Recommended Next Lesson</h3>
        </div>
        <div className="flex items-center justify-between gap-4" style={{ flexWrap: 'wrap' }}>
          <div>
            <p className="font-semibold">{nextLesson.title}</p>
            <p className="text-sm text-muted">
              {nextLevelTitle} · {nextLesson.duration} · +{nextLesson.xp} XP
            </p>
          </div>
          <Link to={`/learn/${nextLesson.id}`} className="btn btn-primary">
            Start Lesson <BookOpen size={16} />
          </Link>
        </div>
      </div>

      {completion.eligible && (
        <div className="card mb-4" style={{ borderColor: '#10b981' }}>
          <div className="card-header">
            <h3 className="card-title">Course Completed</h3>
          </div>
          <p className="text-sm">Congratulations — you met all Computer Quest completion requirements.</p>
          {certificate ? (
            <Link to={`/certificate/${certificate.id}`} className="btn btn-primary btn-sm mt-2">
              View Certificate
            </Link>
          ) : (
            <Link to="/completion" className="btn btn-primary btn-sm mt-2">
              View Certificate
            </Link>
          )}
        </div>
      )}

      {!completion.eligible && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Completion progress</h3>
          </div>
          <p className="text-sm">{completion.percent}% toward certificate eligibility</p>
          <Link to="/completion" className="btn btn-secondary btn-sm mt-2">
            View requirements
          </Link>
        </div>
      )}

      {topWeak.length > 0 && (
        <div className="card mb-4" style={{ borderColor: '#fbbf24' }}>
          <div className="card-header">
            <h3 className="card-title">Topics to improve</h3>
          </div>
          <p className="text-sm text-muted mb-2">Based on your recent test answers.</p>
          <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            {topWeak.map((t) => (
              <span key={t} className="badge badge-warning">
                {t}
              </span>
            ))}
          </div>
          <Link to="/revision" className="btn btn-primary btn-sm">
            Open Revision
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid-3">
        <Link to="/practice" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Practice Lab</p>
          <p className="text-sm text-muted mt-1">Hands-on simulations</p>
        </Link>
        <Link to="/games" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Game Zone</p>
          <p className="text-sm text-muted mt-1">Learn by playing</p>
        </Link>
        <Link to="/tests" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Tests</p>
          <p className="text-sm text-muted mt-1">Level quizzes & scores</p>
        </Link>
      </div>
      <div className="grid-3 mt-3">
        <Link to="/revision" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Revision</p>
          <p className="text-sm text-muted mt-1">Weak topics & review</p>
        </Link>
        <Link to="/ai-tutor" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">AI Tutor</p>
          <p className="text-sm text-muted mt-1">Ask anything</p>
        </Link>
        <Link to="/progress" className="card" style={{ textAlign: 'center' }}>
          <p className="font-semibold">Progress</p>
          <p className="text-sm text-muted mt-1">XP, tests & badges</p>
        </Link>
      </div>
    </div>
  )
}
