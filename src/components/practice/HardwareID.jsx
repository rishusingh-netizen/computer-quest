export default function HardwareID({ activity, onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Identify the hardware components. (Interactive simulation)</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(8, 10)}>Mark complete (demo)</button>
    </div>
  )
}
