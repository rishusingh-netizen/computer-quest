import { useState, useRef, useEffect } from 'react'
import { Bot, Send } from '../components/ui/Icons'
import { useProgress } from '../context/ProgressContext'
import {
  generateHelperReply,
  getSuggestedQuestions,
  HELPER_DISCLAIMER,
} from '../services/questHelper'

export default function AITutor() {
  const progress = useProgress()
  const [messages, setMessages] = useState([
    {
      role: 'helper',
      text: 'Namaste! Main Quest Helper hoon. Computer topics simple language mein samjhaata hoon — English ya Hinglish dono chalenge. (Local teaching guide — live cloud AI nahi.)',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const suggestions = getSuggestedQuestions({ area: 'tutor-page' })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const q = (text || input).trim()
    if (!q || loading) return
    setError('')
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await generateHelperReply({
        message: q,
        context: { area: 'tutor-page', topicHint: '', inActiveTest: false },
        progress: { weakTopics: progress.weakTopics, level: progress.level },
      })
      if (!res.ok) setError(res.error || 'Error')
      else setMessages((m) => [...m, { role: 'helper', text: res.text }])
    } catch {
      setError('Could not get a reply. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-muted mb-2 text-sm">
        Ask computer questions anytime. Same Quest Helper engine as the floating “Ask Helper” button.
      </p>
      <p className="text-sm text-muted mb-4">{HELPER_DISCLAIMER}</p>

      <div className="card" style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
        <div
          className="flex items-center gap-2 mb-4"
          style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 12 }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--cq-primary-light)',
              color: 'var(--cq-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} />
          </div>
          <strong>Quest Helper</strong>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`qh-bubble ${m.role === 'user' ? 'user' : 'helper'}`}
              style={{ maxWidth: '90%' }}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="qh-bubble helper qh-loading">Thinking…</div>}
          {error && <div className="qh-error">{error}</div>}
          <div ref={endRef} />
        </div>

        <div className="qh-suggestions" style={{ borderTop: '1px solid var(--cq-border)', marginTop: 12 }}>
          {suggestions.map((s) => (
            <button key={s} type="button" className="qh-chip" onClick={() => handleSend(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>

        <form
          className="qh-input-row"
          style={{ borderTop: 'none', paddingLeft: 0, paddingRight: 0 }}
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask in English or Hinglish…"
            maxLength={2000}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
