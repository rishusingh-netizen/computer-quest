export default function ShortcutRace({ game }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{game?.instructions || 'Hit the correct shortcuts quickly.'}</p>
      <p className="text-sm">Shortcut race simulation.</p>
    </div>
  )
}
