import { useState, useMemo, useRef } from 'react'

const PAIRS = [
  { id: 'cpu', a: 'CPU', b: 'Processes instructions (brain)' },
  { id: 'ram', a: 'RAM', b: 'Temporary fast memory' },
  { id: 'ssd', a: 'SSD', b: 'Fast permanent storage' },
  { id: 'hdd', a: 'HDD', b: 'Slower spinning disk storage' },
  { id: 'gpu', a: 'GPU', b: 'Renders graphics' },
  { id: 'psu', a: 'Power Supply', b: 'Provides electricity' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HardwareMatch({ onFinish }) {
  const cards = useMemo(() => {
    const items = []
    PAIRS.forEach((p) => {
      items.push({ key: p.id + '-a', pairId: p.id, text: p.a })
      items.push({ key: p.id + '-b', pairId: p.id, text: p.b })
    })
    return shuffle(items)
  }, [])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(() => new Set())
  const [moves, setMoves] = useState(0)
  const lock = useRef(false)

  function handleFlip(key) {
    if (lock.current) return
    if (matched.has(cards.find((c) => c.key === key)?.pairId)) return
    if (flipped.includes(key)) return
    const next = [...flipped, key]
    setFlipped(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [k1, k2] = next
      const c1 = cards.find((c) => c.key === k1)
      const c2 = cards.find((c) => c.key === k2)
      if (c1.pairId === c2.pairId) {
        const nm = new Set(matched)
        nm.add(c1.pairId)
        setMatched(nm)
        setFlipped([])
        if (nm.size === PAIRS.length) {
          const score = Math.max(10, 100 - moves * 3)
          setTimeout(() => onFinish?.(score, { moves: moves + 1 }), 400)
        }
      } else {
        lock.current = true
        setTimeout(() => {
          setFlipped([])
          lock.current = false
        }, 700)
      }
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Match hardware with its job</span>
        <span className="badge badge-primary">Moves: {moves}</span>
      </div>
      <div className="hw-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {cards.map((c) => {
          const isUp = flipped.includes(c.key) || matched.has(c.pairId)
          return (
            <button
              key={c.key}
              type="button"
              className={`hw-card ${isUp ? 'hw-correct' : ''}`}
              onClick={() => handleFlip(c.key)}
              disabled={matched.has(c.pairId)}
            >
              {isUp ? c.text : '?'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
