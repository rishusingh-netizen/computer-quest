export default function EmailCompose({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Compose and send a practice email.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(10, 10)}>Mark complete (demo)</button>
    </div>
  )
}
