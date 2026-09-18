export default function DownloadUpload({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Practice safe download and upload.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(10, 10)}>Mark complete (demo)</button>
    </div>
  )
}
