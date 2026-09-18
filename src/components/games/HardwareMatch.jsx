export default function HardwareMatch({ game }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{game?.instructions || 'Match hardware parts with functions.'}</p>
      <p className="text-sm">Hardware match simulation.</p>
    </div>
  )
}
