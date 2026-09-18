export default function TypingRace({ game }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{game?.instructions || 'Type the sentences as fast as you can.'}</p>
      <p className="text-sm">Typing race simulation (full interactive version in local build).</p>
    </div>
  )
}
