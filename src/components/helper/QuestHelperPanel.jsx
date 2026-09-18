import { useState } from 'react'
import { Bot, X, Send } from '../ui/Icons'
import { generateHelperReply, getSuggestedQuestions, HELPER_DISCLAIMER } from '../../services/questHelper'
import { useProgress } from '../../context/ProgressContext'

export default function QuestHelperPanel({ open, onClose, context = {} }) {
  const progress = useProgress()
  const [messages, setMessages] = useState([
    { role: 'helper', text: 'Hi! Ask me anything about computers. I explain in simple English or Hinglish.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const suggestions = getSuggestedQuestions(context)

  if (!open) return null

  async function send(text) {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    const res = await generateHelperReply({
      message: q,
      context,
      progress: { weakTopics: progress.weakTopics, level: progress.level },
    })
    setLoading(false)
    setMessages((m) => [...m, { role: 'helper', text: res.text || 'Try asking another question.' }])
  }

  return (
    <div className="qh-panel" style={{ position: 'fixed', bottom: 80, right: 20, width: 340, maxHeight: 480, zIndex: 50, background: 'var(--cq-surface)', border: '1px solid var(--cq-border)', borderRadius: 12, boxShadow: 'var(--cq-shadow-md)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between" style={{ padding: 12, borderBottom: '1px solid var(--cq-border)' }}>
        <div className="flex items-center gap-2"><Bot size={18} /><strong>Quest Helper</strong></div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} className={`qh-bubble ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="qh-bubble helper">Thinking…</div>}
      </div>
      <div style={{ padding: 8 }}>
        <div className="qh-suggestions">
          {suggestions.slice(0, 3).map((s) => (
            <button key={s} type="button" className="qh-chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
        <form className="qh-input-row" onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask…" maxLength={500} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}><Send size={14} /></button>
        </form>
        <p className="text-sm text-muted" style={{ fontSize: 10, padding: '4px 0' }}>{HELPER_DISCLAIMER}</p>
      </div>
    </div>
  )
}
