import { useState, useRef } from 'react'

/** Simulated slides — does not control real PowerPoint. */
export default function PowerPointPractice({ onComplete }) {
  const [slides, setSlides] = useState([
    { title: '', bullets: '' },
    { title: '', bullets: '' },
  ])
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)

  function update(field, value) {
    setSlides((prev) => prev.map((s, i) => (i === current ? { ...s, [field]: value } : s)))
  }

  function addSlide() {
    if (slides.length >= 5) return
    setSlides((s) => [...s, { title: '', bullets: '' }])
    setCurrent(slides.length)
  }

  function check() {
    let s = 0
    if (slides.length >= 2) s += 1
    if (slides[0].title.trim().length >= 3) s += 1
    if (slides.some((sl) => sl.bullets.trim().length >= 10)) s += 1
    if (slides.filter((sl) => sl.title.trim()).length >= 2) s += 1
    if (slides.every((sl) => sl.title.trim() || sl.bullets.trim())) s += 1
    scoreRef.current = s
    if (s >= 4) {
      setMsg(`✓ Presentation structure looks good (${s}/5).`)
      setDone(true)
      onComplete?.(s, 5)
    } else {
      setMsg('Need 2+ slides, titles on at least two, and bullet text on one slide.')
    }
  }

  const slide = slides[current]

  return (
    <div className="card">
      <h3 className="card-title mb-2">PowerPoint practice (simulation)</h3>
      <p className="text-sm text-muted mb-3">Build a mini deck. Does not open real PowerPoint.</p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`btn btn-sm ${i === current ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrent(i)}
          >
            Slide {i + 1}
          </button>
        ))}
        <button type="button" className="btn btn-sm btn-secondary" onClick={addSlide}>
          + Slide
        </button>
      </div>
      <input
        className="input mb-2"
        value={slide.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="Slide title"
      />
      <textarea
        className="input mb-3"
        rows={4}
        value={slide.bullets}
        onChange={(e) => update('bullets', e.target.value)}
        placeholder="Bullet points..."
      />
      {!done && (
        <button type="button" className="btn btn-primary" onClick={check}>
          Finish practice
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
