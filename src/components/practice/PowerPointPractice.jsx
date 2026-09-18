export default function PowerPointPractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Create a simple presentation.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(9, 10)}>Mark complete (demo)</button>
    </div>
  )
}
