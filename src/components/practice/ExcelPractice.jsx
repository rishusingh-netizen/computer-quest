export default function ExcelPractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Spreadsheet basics practice.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(8, 10)}>Mark complete (demo)</button>
    </div>
  )
}
