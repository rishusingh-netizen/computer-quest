import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowRight } from '../ui/Icons'
import { useProgress } from '../../context/ProgressContext'
import { buildTestAttempt } from '../../data/tests'

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function TestRunner({ test }) {
  const { recordTest, testScores } = useProgress()
  const [phase, setPhase] = useState('intro')
  const [useTimer, setUseTimer] = useState(true)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(test.timeLimitSec)
  const [startedAt, setStartedAt] = useState(null)
  const [result, setResult] = useState(null)
  const submittedRef = useRef(false)
  const answersRef = useRef({})
  const questionsRef = useRef([])
  const prev = testScores?.[test.id]

  const startTest = useCallback(() => {
    const qs = buildTestAttempt(test.id, test.questionCount)
    if (!qs.length) return
    questionsRef.current = qs
    answersRef.current = {}
    submittedRef.current = false
    setQuestions(qs)
    setAnswers({})
    setCurrent(0)
    setTimeLeft(test.timeLimitSec)
    setStartedAt(Date.now())
    setResult(null)
    setPhase('taking')
  }, [test])

  const submit = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    const qs = questionsRef.current
    const ans = answersRef.current
    let correct = 0
    const topicMap = {}
    qs.forEach((q, i) => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { topic: q.topic, correct: 0, total: 0 }
      topicMap[q.topic].total += 1
      if (ans[i] === q.correctIndex) {
        correct += 1
        topicMap[q.topic].correct += 1
      }
    })
    const total = qs.length
    const pct = total ? Math.round((correct / total) * 100) : 0
    const passed = pct >= (test.passPercent || 60)
    const timeTaken = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
    const topicStats = Object.values(topicMap)
    const weakTopics = topicStats.filter((t) => t.total > 0 && t.correct / t.total < 0.5).map((t) => t.topic)
    recordTest(test.id, correct, total, { xpReward: test.xpReward, weakTopics, timeTaken, passed, topicStats })
    const isFirst = !prev || !prev.attempts
    const beatBest = prev && correct > (prev.bestScore || 0)
    let xpEarned = 0
    if (isFirst) xpEarned = test.xpReward
    else if (beatBest) xpEarned = Math.max(5, Math.floor(test.xpReward / 3))
    setResult({ correct, total, pct, passed, timeTaken, xpEarned, topicStats, weakTopics, answers: { ...ans }, questions: qs })
    setPhase('result')
  }, [test, startedAt, recordTest, prev])

  useEffect(() => {
    if (phase !== 'taking' || !useTimer) return
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); submit(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, useTimer, submit])

  function selectAnswer(optIdx) {
    if (phase !== 'taking') return
    const next = { ...answersRef.current, [current]: optIdx }
    answersRef.current = next
    setAnswers(next)
  }

  if (phase === 'intro') {
    return (
      <div className="practice-shell">
        <Link to="/tests" className="back-link">← All Tests</Link>
        <div className="card practice-intro">
          <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Level {test.level}</span>
            <span className="badge badge-warning">+{test.xpReward} XP</span>
            <span className="badge badge-success">{test.questionCount} questions</span>
            <span className="badge badge-primary">Pass {test.passPercent}%</span>
          </div>
          <h2 className="practice-title">{test.title}</h2>
          <p className="text-muted mb-3">{test.description}</p>
          <ul className="key-points mb-4">
            <li>Questions are randomized each attempt</li>
            <li>You can move Next / Previous and change answers</li>
            <li>Optional timer: {formatTime(test.timeLimitSec)} — auto-submits at 0</li>
            <li>Review answers and explanations after submit</li>
          </ul>
          {prev && prev.attempts > 0 && (
            <p className="text-sm text-muted mb-3">
              Best: {prev.bestScore}/{prev.total || test.questionCount} ({prev.accuracy || 0}%) · Attempts: {prev.attempts}
              {prev.passed ? ' · Passed' : ''}
            </p>
          )}
          <label className="flex items-center gap-2 mb-4 text-sm" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
            Enable timer ({formatTime(test.timeLimitSec)})
          </label>
          <button type="button" className="btn btn-primary" onClick={startTest}>Start Test →</button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="practice-shell">
        <Link to="/tests" className="back-link">← All Tests</Link>
        <div className="card practice-result">
          <div style={{ textAlign: 'center' }}>
            {result.passed ? <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} /> : <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />}
            <h2 className="practice-title">{result.passed ? 'Passed!' : 'Keep practicing'}</h2>
            <p className="mt-2" style={{ fontSize: '1.25rem' }}>{result.correct} / {result.total} correct ({result.pct}%)</p>
            <p className="text-sm text-muted mt-1">Wrong: {result.total - result.correct} · Time: {formatTime(result.timeTaken)}</p>
            {result.xpEarned > 0 ? (
              <p className="mt-2" style={{ color: '#047857', fontWeight: 600 }}>+{result.xpEarned} XP earned</p>
            ) : (
              <p className="text-sm text-muted mt-2">No new XP — beat your best score for a bonus.</p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="card-title mb-2">Topic performance</h3>
            {result.topicStats.map((t) => {
              const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0
              return (
                <div key={t.topic} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.topic}</span>
                    <span className="text-muted">{t.correct}/{t.total} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct < 50 ? 'var(--cq-danger)' : pct < 70 ? 'var(--cq-warning)' : 'var(--cq-accent)' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setPhase('review')}>Review Answers</button>
            <button type="button" className="btn btn-primary" onClick={() => setPhase('intro')}>Retry Test</button>
            <Link to="/tests" className="btn btn-secondary">All Tests <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'review' && result) {
    return (
      <div className="practice-shell">
        <Link to="/tests" className="back-link">← All Tests</Link>
        <div className="card">
          <h2 className="practice-title mb-4">Answer review</h2>
          {result.questions.map((q, i) => {
            const selected = result.answers[i]
            const ok = selected === q.correctIndex
            return (
              <div key={q.id || i} className="mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
                <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                {(q.options || []).map((opt, oi) => {
                  let cls = 'quiz-option'
                  if (oi === q.correctIndex) cls += ' correct'
                  if (selected === oi && !ok) cls += ' wrong'
                  if (selected === oi) cls += ' selected'
                  return <div key={oi} className={cls} style={{ pointerEvents: 'none' }}>{opt}</div>
                })}
                {q.explanation && <p className="text-sm text-muted mt-2">{q.explanation}</p>}
              </div>
            )
          })}
          <button type="button" className="btn btn-primary" onClick={() => setPhase('result')}>Back to results</button>
        </div>
      </div>
    )
  }

  const q = questions[current]
  if (!q) return null
  return (
    <div className="practice-shell">
      <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <span className="text-sm text-muted">Question {current + 1} / {questions.length}</span>
        {useTimer && <span className="badge badge-warning">⏱ {formatTime(timeLeft)}</span>}
      </div>
      <div className="card">
        <p className="text-sm text-muted mb-1">{q.topic} · {q.type}</p>
        <h2 className="practice-title mb-4">{q.question}</h2>
        {(q.options || []).map((opt, oi) => (
          <button key={oi} type="button" className={`quiz-option ${answers[current] === oi ? 'selected' : ''}`} onClick={() => selectAnswer(oi)}>
            {opt}
          </button>
        ))}
        <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>← Previous</button>
          {current < questions.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next →</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submit}>Submit Test</button>
          )}
        </div>
        <p className="text-sm text-muted mt-3">Answered: {Object.keys(answers).length} / {questions.length}</p>
      </div>
    </div>
  )
}
