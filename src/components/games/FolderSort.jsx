import { useState, useEffect, useRef, useCallback } from 'react'

const FOLDERS = [
  { id: 'docs', name: 'Documents', accept: ['pdf', 'doc', 'txt'] },
  { id: 'pics', name: 'Pictures', accept: ['jpg', 'png', 'gif'] },
  { id: 'music', name: 'Music', accept: ['mp3', 'wav'] },
  { id: 'vids', name: 'Videos', accept: ['mp4', 'avi'] },
]

const FILES_POOL = [
  { name: 'report.pdf', type: 'pdf' },
  { name: 'photo.jpg', type: 'jpg' },
  { name: 'song.mp3', type: 'mp3' },
  { name: 'movie.mp4', type: 'mp4' },
  { name: 'notes.txt', type: 'txt' },
  { name: 'logo.png', type: 'png' },
  { name: 'essay.doc', type: 'doc' },
  { name: 'clip.avi', type: 'avi' },
  { name: 'track.wav', type: 'wav' },
  { name: 'meme.gif', type: 'gif' },
]

const DURATION = 60
const MAX_LIVES = 3

export default function FolderSort({ onFinish }) {
  const [files, setFiles] = useState(() =>
    FILES_POOL.map((f, i) => ({ ...f, id: i, sorted: false })),
  )
  const [current, setCurrent] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const finished = useRef(false)

  const remaining = files.filter((f) => !f.sorted)
  const active = remaining[current % Math.max(remaining.length, 1)]

  const endGame = useCallback(() => {
    if (finished.current) return
    finished.current = true
    const finalScore = scoreRef.current
    onFinish(finalScore, { detail: `${finalScore} correct sorts` })
  }, [onFinish])

  useEffect(() => {
    if (finished.current) return
    if (timeLeft <= 0 || lives <= 0) {
      endGame()
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, lives, endGame])

  function place(folderId) {
    if (finished.current || !active) return
    const folder = FOLDERS.find((f) => f.id === folderId)
    const ok = folder?.accept.includes(active.type)
    if (ok) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setFiles((prev) => prev.map((f) => (f.id === active.id ? { ...f, sorted: true } : f)))
      const left = remaining.length - 1
      if (left <= 0) {
        endGame()
        return
      }
      setCurrent(0)
    } else {
      setLives((l) => {
        const n = l - 1
        if (n <= 0) setTimeout(endGame, 100)
        return n
      })
    }
  }

  if (!active && !finished.current) {
    endGame()
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Time: {timeLeft}s</span>
        <span className="badge badge-primary">Score {score}</span>
        <span className="badge badge-danger">Lives {lives}</span>
      </div>
      <p className="text-sm text-muted mb-3">
        Sort each file into the correct folder. Wrong folder costs a life.
      </p>
      {active && (
        <div
          className="hw-card mb-4"
          style={{ textAlign: 'center', padding: 20, fontSize: '1.1rem', fontWeight: 600 }}
        >
          📄 {active.name}
        </div>
      )}
      <div className="grid-2">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="btn btn-secondary"
            style={{ padding: '16px 12px' }}
            onClick={() => place(f.id)}
            disabled={finished.current || !active}
          >
            📁 {f.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted mt-3">Simulated sort — does not move real files on your device.</p>
    </div>
  )
}
