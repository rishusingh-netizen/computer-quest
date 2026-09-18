export default function DesktopSim({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Explore a simulated desktop environment.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(8, 10)}>Mark complete (demo)</button>
    </div>
  )
}
