export default function DesignPractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Basic visual design practice.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(8, 10)}>Mark complete (demo)</button>
    </div>
  )
}
