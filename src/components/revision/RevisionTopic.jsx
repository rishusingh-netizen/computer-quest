import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Lightbulb } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'

const XP_REWARD = 12

/**
 * Short revision session: summary → tips → mini quiz → results
 */
export default function RevisionTopic({ topic }) {
  const { completeRevision } = useProgress()
  const [phase, setPhase] = useState('content') // content | quiz | done
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showFb, setShowFb] = useState(false)
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  const questions = topic.quiz || []
  const q = questions[qi]

  function check() {
    if (selected === null || showFb) return
    if (selected === q.correctIndex) setScore((s) => s + 1)
    setShowFb(true)
  }

  function next() {
    if (qi >= questions.length - 1) {
      finishAfterLast()
      return
    }
    setQi((i) => i + 1)
    setSelected(null)
    setShowFb(false)
  }

  function finishAfterLast() {
    const total = questions.length
    const finalScore = score + (selected === q?.correctIndex && showFb ? 0 : 0)
    // score already includes last correct via check()
    completeRevision(topic.id, score, total, XP_REWARD, topic.matchTopics || [])
    setXpEarned(XP_REWARD)
    setPhase('done')
  }

  if (phase === 'done') {
    const total = questions.length
    const pct = total ? Math.round((score / total) * 100) : 0
    return (
      <div className="practice-shell">
        <Link to="/revision" className="back-link">
          ← All Revision
        </Link>
        <div className="card practice-result" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h2 className="practice-title">Revision complete!</h2>
          <p className="mt-2">
            Score: <strong>{score}/{total}</strong> ({pct}%)
          </p>
          <p className="mt-2" style={{ color: '#047857', fontWeight: 600 }}>
            +{xpEarned || XP_REWARD} XP
          </p>
          <div className="flex gap-2 mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setPhase('content')
                setQi(0)
                setSelected(null)
                setShowFb(false)
                setScore(0)
                setXpEarned(0)
              }}
            >
              Retry revision
            </button>
            <Link to="/revision" className="btn btn-primary">
              More topics
            </Link>
            {(topic.testIds || []).map((tid) => (
              <Link key={tid} to={`/tests/${tid}`} className="btn btn-secondary">
                Retake Test
              </Link>
            ))}
          </div>
          {(topic.practiceIds || []).length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted mb-2">Need more practice?</p>
              {(topic.practiceIds || []).map((pid) => (
                <Link key={pid} to={`/practice/${pid}`} className="btn btn-secondary btn-sm" style={{ margin: 4 }}>
                  Practice: {pid}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'quiz' && q) {
    return (
      <div className="practice-shell">
        <Link to="/revision" className="back-link">
          ← All Revision
        </Link>
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Quick quiz · {qi + 1}/{questions.length}
            </span>
            <span className="badge badge-primary">{score} correct</span>
          </div>
          <p className="font-semibold mb-3">{q.q}</p>
          {q.options.map((opt, idx) => {
            let cls = 'quiz-option'
            if (selected === idx) cls += ' selected'
            if (showFb) {
              if (idx === q.correctIndex) cls += ' correct'
              else if (idx === selected) cls += ' wrong'
            }
            return (
              <button
                key={idx}
                type="button"
                className={cls}
                disabled={showFb}
                onClick={() => setSelected(idx)}
              >
                {opt}
              </button>
            )
          })}
          {showFb && (
            <div
              className="mt-3 text-sm"
              style={{
                padding: 12,
                borderRadius: 8,
                background: selected === q.correctIndex ? '#d1fae5' : '#fee2e2',
              }}
            >
              {selected === q.correctIndex ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} color="#047857" /> Correct!
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={16} color="#b91c1c" /> Incorrect.
                </span>
              )}
              <p className="mt-1">{q.explanation}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {!showFb ? (
              <button type="button" className="btn btn-primary" onClick={check} disabled={selected === null}>
                Check Answer
              </button>
            ) : qi < questions.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Next Question
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={finishAfterLast}>
                Finish Revision
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // content phase
  return (
    <div className="practice-shell">
      <Link to="/revision" className="back-link">
        ← All Revision
      </Link>
      <div className="card mb-3">
        <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-primary">Level {topic.level}</span>
          <span className="badge badge-warning">+{XP_REWARD} XP</span>
          <span className="badge badge-success">Quick revise</span>
        </div>
        <h2 className="practice-title">{topic.title}</h2>
        <p className="text-muted mt-2">{topic.summary}</p>
      </div>

      <div className="card mb-3">
        <h3 className="card-title mb-2">Key points</h3>
        <ul className="key-points">
          {(topic.keyPoints || []).map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>

      <div className="card mb-3">
        <h3 className="card-title mb-2">Common mistakes</h3>
        <ul className="key-points">
          {(topic.commonMistakes || []).map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>

      <div className="card mb-3" style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={18} color="#b45309" />
          <span className="font-semibold" style={{ color: '#92400e' }}>
            Memory tip
          </span>
        </div>
        <p className="text-sm" style={{ color: '#92400e' }}>
          {topic.tip}
        </p>
      </div>

      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => setPhase('quiz')}>
          Start mini quiz →
        </button>
        <Link to="/revision" className="btn btn-secondary">
          Back
        </Link>
      </div>
    </div>
  )
}
