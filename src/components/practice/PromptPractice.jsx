export default function PromptPractice({ onComplete }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Write clear prompts.</p>
      <button type="button" className="btn btn-primary" onClick={() => onComplete?.(10, 10)}>Mark complete (demo)</button>
    </div>
  )
}
