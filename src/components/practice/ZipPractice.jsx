export default function ZipPractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Compress and extract files.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(9, 10)}>Mark complete (demo)</button>
    </div>
  )
}
