import { useState, useMemo, useRef } from 'react'

const PAIRS = [
  { id: 'cpu', a: 'CPU', b: 'Processes instructions (brain)' },
  { id: 'ram', a: 'RAM', b: 'Temporary fast memory' },
  { id: 'ssd', a: 'SSD', b: 'Fast permanent storage' },
  { id: 'hdd', a: 'HDD', b: 'Slower spinning disk storage' },
  { id: 'kb', a: 'Keyboard', b: 'Typing input device' },
  { id: 'mon', a: 'Monitor', b: 'Display / output screen' },
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
    const list = []
    PAIRS.forEach((p) => {
      list.push({ key: p.id + '-a', pairId: p.id, text: p.a })
      list.push({ key: p.id + '-b', pairId: p.id, text: p.b })
    })
    return shuffle(list)
  }, [])

  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const matchedRef = useRef([])
  const flippedRef = useRef([])
  const [moves, setMoves] = useState(0)
  const movesRef = useRef(0)
  const [lock, setLock] = useState(false)
  const finishedRef = useRef(false)

  function flip(key) {
    if (lock || matchedRef.current.includes(key) || flippedRef.current.includes(key)) return
    if (flippedRef.current.length === 0) {
      flippedRef.current = [key]
      setFlipped([key])
      return
    }
    if (flippedRef.current.length === 1) {
      const first = flippedRef.current[0]
      const next = [first, key]
      flippedRef.current = next
      setFlipped(next)
      movesRef.current += 1
      setMoves(movesRef.current)
      const c1 = cards.find((c) => c.key === first)
      const c2 = cards.find((c) => c.key === key)
      if (c1.pairId === c2.pairId) {
        const newMatched = [...matchedRef.current, first, key]
        matchedRef.current = newMatched
        setMatched(newMatched)
        flippedRef.current = []
        setFlipped([])
        if (newMatched.length >= cards.length && !finishedRef.current) {
          finishedRef.current = true
          const score = Math.max(10, 100 - movesRef.current * 3)
          setTimeout(() => onFinish(score, { detail: `Matched in ${movesRef.current} moves` }), 400)
        }
      } else {
        setLock(true)
        setTimeout(() => {
          flippedRef.current = []
          setFlipped([])
          setLock(false)
        }, 700)
      }
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Match the pairs</span>
        <span className="badge badge-primary">Moves {moves}</span>
      </div>
      <div className="memory-grid">
        {cards.map((c) => {
          const isUp = flipped.includes(c.key) || matched.includes(c.key)
          const isMatch = matched.includes(c.key)
          return (
            <button
              key={c.key}
              type="button"
              data-pair={c.pairId}
              data-key={c.key}
              className={`memory-card ${isUp ? 'up' : ''} ${isMatch ? 'matched' : ''}`}
              onClick={() => flip(c.key)}
              disabled={isMatch}
            >
              {isUp ? c.text : '?'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
