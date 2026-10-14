import { useState } from 'react'

const BLOCKS = [
  { id: 'start', text: 'Start' },
  { id: 'input', text: 'Get user input' },
  { id: 'process', text: 'Process / calculate' },
  { id: 'output', text: 'Show result' },
]

const CORRECT = ['start', 'input', 'process', 'output']

export default function CodeBlocksPractice({ onComplete }) {
  const [order, setOrder] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')

  function add(id) {
    if (done || order.includes(id)) return
    setOrder((o) => [...o, id])
  }

  function reset() {
    setOrder([])
    setMsg('')
    setDone(false)
  }

  function check() {
    const ok = order.length === CORRECT.length && order.every((id, i) => id === CORRECT[i])
    if (ok) {
      setMsg('✓ Correct program order!')
      setDone(true)
      onComplete?.(4, 4)
    } else {
      setMsg('✗ Not quite — think: start → input → process → output')
    }
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">Arrange the logic blocks</h3>
      <p className="text-sm text-muted mb-3">Click blocks in the order a simple program should run.</p>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        {BLOCKS.map((b) => (
          <button
            key={b.id}
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={order.includes(b.id) || done}
            onClick={() => add(b.id)}
          >
            {b.text}
          </button>
        ))}
      </div>
      <p className="text-sm mb-3">
        Your order: {order.length ? order.map((id) => BLOCKS.find((b) => b.id === id)?.text).join(' → ') : '—'}
      </p>
      <div className="flex gap-2">
        {!done && (
          <>
            <button type="button" className="btn btn-primary" onClick={check} disabled={order.length < 4}>
              Check order
            </button>
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          </>
        )}
      </div>
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
