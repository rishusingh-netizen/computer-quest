import { useProgress } from '../context/ProgressContext'
import { LEVELS } from '../data/levels'
import { GAMES } from '../data/games'
import { Link } from 'react-router-dom'
import { BarChart3, Trophy, Zap } from '../components/ui/Icons'

export default function Progress() {
  const {
    xp,
    level,
    streak,
    completedLessons,
    practiceCompleted,
    gamesPlayed,
    testScores,
    revisionCompleted,
    achievements,
    weakTopics,
    progressPercent,
    lessonsCompletedCount,
    totalLessons,
  } = useProgress()

  return (
    <div>
      <h2 className="card-title mb-3">Your Progress</h2>

      <div className="grid-4 mb-4">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><Zap size={20} /></div>
          <div className="stat-value">{xp}</div>
          <div className="stat-label">XP</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#047857' }}><Trophy size={20} /></div>
          <div className="stat-value">Lv {level}</div>
          <div className="stat-label">Level</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>🔥</div>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><BarChart3 size={20} /></div>
          <div className="stat-value">{progressPercent}%</div>
          <div className="stat-label">Course</div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-2">Lessons ({lessonsCompletedCount}/{totalLessons})</h3>
        <div className="progress-bar mb-2">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        {LEVELS.map((lv) => {
          const done = (lv.lessons || []).filter((l) => completedLessons.includes(l.id || `L${lv.id}-${l}`)).length
          const total = (lv.lessons || []).length
          return (
            <div key={lv.id} className="text-sm mb-2">
              Level {lv.id}: {lv.title} — {done}/{total}
            </div>
          )
        })}
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="card-title mb-2">Practice</h3>
          <p className="text-sm">{practiceCompleted.length} activities completed</p>
          <Link to="/practice" className="btn btn-secondary btn-sm mt-2">Practice Lab</Link>
        </div>
        <div className="card">
          <h3 className="card-title mb-2">Games</h3>
          <p className="text-sm">{Object.keys(gamesPlayed || {}).length} games played</p>
          <Link to="/games" className="btn btn-secondary btn-sm mt-2">Game Zone</Link>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-2">Tests</h3>
        {Object.keys(testScores || {}).length === 0 ? (
          <p className="text-sm text-muted">No tests taken yet.</p>
        ) : (
          Object.entries(testScores).map(([id, s]) => (
            <div key={id} className="text-sm mb-1">
              {id}: best {s.bestScore}/{s.total} ({s.accuracy}%) · {s.passed ? 'Passed' : 'Not passed'}
            </div>
          ))
        )}
      </div>

      {weakTopics?.length > 0 && (
        <div className="card mb-4">
          <h3 className="card-title mb-2">Weak topics</h3>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {weakTopics.map((t) => (
              <span key={t} className="badge badge-warning">{t}</span>
            ))}
          </div>
          <Link to="/revision" className="btn btn-secondary btn-sm mt-2">Revision</Link>
        </div>
      )}

      {achievements?.length > 0 && (
        <div className="card">
          <h3 className="card-title mb-2">Achievements</h3>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {achievements.map((a) => (
              <span key={a} className="badge badge-success">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
