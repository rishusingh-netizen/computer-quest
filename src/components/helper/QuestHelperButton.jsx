import { Bot } from '../ui/Icons'

export default function QuestHelperButton({ onClick }) {
  return (
    <button
      type="button"
      className="qh-fab"
      onClick={onClick}
      aria-label="Open Quest Helper AI Tutor"
      title="Quest Helper — ask for study help"
    >
      <span className="qh-fab-icon" aria-hidden="true">
        <Bot size={22} />
      </span>
      <span className="qh-fab-text">
        <span className="qh-fab-title">Quest Helper</span>
        <span className="qh-fab-sub">Ask anything</span>
      </span>
    </button>
  )
}
