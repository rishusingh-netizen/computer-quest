import { useState, useRef } from 'react'

const INITIAL = [
  { id: 'f1', name: 'Homework.docx', type: 'file', folder: 'Documents' },
  { id: 'f2', name: 'Photo.png', type: 'file', folder: 'Pictures' },
  { id: 'f3', name: 'Notes.txt', type: 'file', folder: 'Desktop' },
  { id: 'f4', name: 'Song.mp3', type: 'file', folder: 'Music' },
]

const FOLDERS = ['Documents', 'Pictures', 'Desktop', 'Music']

const TASKS = [
  { text: 'Select Homework.docx', check: (s) => s.selected === 'f1' },
  { text: 'Move Photo.png into Pictures (if not already)', check: (s) => s.files.find((f) => f.id === 'f2')?.folder === 'Pictures' },
  { text: 'Rename Notes.txt to Notes-final.txt', check: (s) => s.files.some((f) => f.name === 'Notes-final.txt') },
  { text: 'Put Song.mp3 in Music', check: (s) => s.files.find((f) => f.id === 'f4')?.folder === 'Music' },
]

export default function FileManager({ onComplete }) {
  const [files, setFiles] = useState(INITIAL)
  const [selected, setSelected] = useState(null)
  const [folder, setFolder] = useState('Documents')
  const [taskIndex, setTaskIndex] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [msg, setMsg] = useState('')

  const visible = files.filter((f) => f.folder === folder)
  const task = TASKS[taskIndex]

  function tryCompleteTask() {
    const state = { files, selected }
    if (task.check(state)) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setMsg('✓ Task complete!')
      return true
    }
    setMsg('Keep going — task not finished yet.')
    return false
  }

  function moveSelected() {
    if (!selected) return
    setFiles((prev) => prev.map((f) => (f.id === selected ? { ...f, folder } : f)))
  }

  function renameSelected() {
    if (!selected) return
    setFiles((prev) =>
      prev.map((f) => (f.id === selected && f.name === 'Notes.txt' ? { ...f, name: 'Notes-final.txt' } : f)),
    )
  }

  function next() {
    if (taskIndex + 1 >= TASKS.length) {
      onComplete?.(scoreRef.current, TASKS.length)
      return
    }
    setTaskIndex((i) => i + 1)
    setMsg('')
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">File & folder simulation</span>
        <span className="badge badge-primary">
          Task {taskIndex + 1}/{TASKS.length}
        </span>
      </div>
      <p className="font-semibold mb-3">{task.text}</p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {FOLDERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm ${folder === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFolder(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <ul className="mb-3">
        {visible.map((f) => (
          <li key={f.id} className="mb-1">
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: selected === f.id ? '#dbeafe' : '#f8fafc' }}
              onClick={() => setSelected(f.id)}
            >
              📄 {f.name}
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="text-sm text-muted">Empty folder</li>}
      </ul>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={moveSelected}>
          Move selected here
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={renameSelected}>
          Rename Notes.txt → Notes-final.txt
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => tryCompleteTask() && null}>
          Check task
        </button>
      </div>
      {msg && <p className="text-sm mb-2">{msg}</p>}
      {msg.startsWith('✓') && (
        <button type="button" className="btn btn-primary" onClick={next}>
          {taskIndex + 1 >= TASKS.length ? 'Finish' : 'Next task →'}
        </button>
      )}
      <p className="text-sm text-muted mt-3">Simulated files — does not change files on your computer.</p>
    </div>
  )
}
