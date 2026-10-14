import { useState, useRef } from 'react'

const FILES = ['Report.docx', 'Photo1.png', 'Photo2.png', 'Notes.txt']

export default function ZipPractice({ onComplete }) {
  const [selected, setSelected] = useState([])
  const [zipped, setZipped] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)

  function toggle(f) {
    setSelected((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  function makeZip() {
    if (selected.length < 2) {
      setMsg('Select at least 2 files to compress.')
      return
    }
    setZipped(true)
    setMsg(`✓ Created archive with ${selected.length} files (simulated).`)
    scoreRef.current += 1
  }

  function extract() {
    if (!zipped) {
      setMsg('Create a zip first.')
      return
    }
    setExtracted(true)
    scoreRef.current += 1
    setMsg('✓ Extracted archive (simulated).')
    onComplete?.(scoreRef.current, 2)
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">ZIP compress & extract</h3>
      <p className="text-sm text-muted mb-3">Simulation only — does not create real zip files on your device.</p>
      <ul className="mb-3">
        {FILES.map((f) => (
          <li key={f} className="mb-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={selected.includes(f)} onChange={() => toggle(f)} />
              {f}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={makeZip} disabled={zipped}>
          Compress selected
        </button>
        <button type="button" className="btn btn-primary" onClick={extract} disabled={!zipped || extracted}>
          Extract archive
        </button>
      </div>
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
