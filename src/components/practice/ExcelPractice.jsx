import { useState, useRef } from 'react'

/** Simulated spreadsheet — does not control real Excel. */
export default function ExcelPractice({ onComplete }) {
  const [cells, setCells] = useState({ A1: '10', A2: '20', A3: '30', B1: '', B2: '', B3: '' })
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const scoreRef = useRef(0)

  function setCell(k, v) {
    setCells((c) => ({ ...c, [k]: v }))
  }

  function sumA() {
    const n = ['A1', 'A2', 'A3'].map((k) => Number(cells[k]) || 0)
    return n.reduce((a, b) => a + b, 0)
  }

  function check() {
    let s = 0
    if (Number(cells.A1) === 10 && Number(cells.A2) === 20 && Number(cells.A3) === 30) s += 1
    const total = sumA()
    if (String(cells.B1).trim() === String(total) || Number(cells.B1) === total) s += 1
    if (Number(cells.B2) === Math.max(10, 20, 30)) s += 1
    if (cells.B3.trim().length > 0) s += 1
    scoreRef.current = s
    if (s >= 3) {
      setMsg(`✓ Spreadsheet tasks done (score ${s}/4).`)
      setDone(true)
      onComplete?.(s, 4)
    } else {
      setMsg('Fill A1–A3 as 10,20,30; put the sum in B1; max in B2; any note in B3.')
    }
  }

  return (
    <div className="card">
      <h3 className="card-title mb-2">Excel grid practice (simulation)</h3>
      <p className="text-sm text-muted mb-3">
        Enter values and compute a sum. This does not open real Microsoft Excel.
      </p>
      <table className="text-sm mb-3" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th></th>
            <th>A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((row) => (
            <tr key={row}>
              <td>{row}</td>
              <td>
                <input
                  className="input"
                  value={cells[`A${row}`]}
                  onChange={(e) => setCell(`A${row}`, e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  className="input"
                  value={cells[`B${row}`]}
                  onChange={(e) => setCell(`B${row}`, e.target.value)}
                  style={{ width: '100%' }}
                  placeholder={row === 1 ? 'Sum of A' : row === 2 ? 'Max of A' : 'Note'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm mb-2">Hint: A column total is {sumA()}.</p>
      {!done && (
        <button type="button" className="btn btn-primary" onClick={check}>
          Check answers
        </button>
      )}
      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  )
}
