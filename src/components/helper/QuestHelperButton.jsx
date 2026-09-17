import { Bot } from '../ui/Icons'

export default function QuestHelperButton({ onClick }) {
  return (
    <button type="button" className="qh-fab" onClick={onClick} aria-label="Ask Quest Helper">
      <Bot size={22} />
      <span className="qh-fab-label">Ask Helper</span>
    </button>
  )
}
