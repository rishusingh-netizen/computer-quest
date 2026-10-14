import { useState, useRef } from 'react'

export default function SettingsPractice({ onComplete }) {
  const [brightness, setBrightness] = useState(50)
  const [volume, setVolume] = useState(30)
  const [wifi, setWifi] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)
  const [finished, setFinished] = useState(false)

  function check() {
    let s = 0
    if (brightness >= 70) s += 1
    if (volume >= 50) s += 1
    if (wifi) s += 1
    scoreRef.current = s
    if (s < 3) {
      setMsg('Goals: brightness ≥ 70, volume ≥ 50, Wi‑Fi ON.')
      return
    }
    setMsg('✓ Settings look good!')
    setFinished(true)
    onComplete?.(s, 3)
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">System settings (simulation)</h3>
      <p className="text-sm text-muted mb-3">Adjust the controls to meet the goals. Does not change your real device settings.</p>
      <label className="text-sm">Brightness: {brightness}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={brightness}
        onChange={(e) => setBrightness(Number(e.target.value))}
        className="mb-3"
        style={{ width: '100%' }}
      />
      <label className="text-sm">Volume: {volume}</label>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="mb-3"
        style={{ width: '100%' }}
      />
      <label className="flex items-center gap-2 mb-3">
        <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} />
        Wi‑Fi {wifi ? 'ON' : 'OFF'}
      </label>
      {!finished && (
        <button type="button" className="btn btn-primary" onClick={check}>
          Check settings
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
