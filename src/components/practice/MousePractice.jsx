export default function MousePractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Practice click, double-click and drag.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(10, 10)}>Mark complete (demo)</button>
    </div>
  )
}
