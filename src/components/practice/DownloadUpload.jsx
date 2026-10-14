import { useState, useRef } from 'react'

const TASKS = [
  { id: 'download', label: 'Simulate downloading a file from the web' },
  { id: 'upload', label: 'Simulate uploading a homework file' },
]

export default function DownloadUpload({ onComplete }) {
  const [done, setDone] = useState({ download: false, upload: false })
  const [log, setLog] = useState([])
  const scoreRef = useRef(0)

  function doDownload() {
    if (done.download) return
    setDone((d) => ({ ...d, download: true }))
    setLog((l) => [...l, '✓ Downloaded “lesson-notes.pdf” (simulated)'])
    scoreRef.current += 1
    maybeFinish({ ...done, download: true })
  }

  function doUpload() {
    if (done.upload) return
    setDone((d) => ({ ...d, upload: true }))
    setLog((l) => [...l, '✓ Uploaded “homework.docx” (simulated)'])
    scoreRef.current += 1
    maybeFinish({ ...done, upload: true })
  }

  function maybeFinish(state) {
    if (state.download && state.upload) {
      onComplete?.(2, 2)
    }
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">Download & upload</h3>
      <p className="text-sm text-muted mb-3">
        Practice the idea of download vs upload. No real network transfer happens.
      </p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={doDownload} disabled={done.download}>
          Download lesson-notes.pdf
        </button>
        <button type="button" className="btn btn-secondary" onClick={doUpload} disabled={done.upload}>
          Upload homework.docx
        </button>
      </div>
      <ul className="text-sm">
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {done.download && done.upload && (
        <p className="text-sm mt-3" style={{ color: '#047857' }}>
          Both actions completed.
        </p>
      )}
    </div>
  )
}
