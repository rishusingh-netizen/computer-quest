import { LEVELS } from '../../data/levels'
import { PRACTICE_ACTIVITIES } from '../../data/practice'
import { GAMES } from '../../data/games'
import { TESTS } from '../../data/tests'

export default function AdminCurriculum() {
  return (
    <div>
      <h2 className="card-title mb-3">Curriculum</h2>
      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Levels & lessons</h3>
          {LEVELS.map((lv) => (
            <div key={lv.id} className="text-sm mb-2" style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 6 }}>
              <strong>L{lv.id}: {lv.title}</strong>
              <div className="text-muted">{(lv.lessons || []).length} lessons</div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Activities</h3>
          <p className="text-sm">Practice: {(PRACTICE_ACTIVITIES || []).length}</p>
          <p className="text-sm">Games: {(GAMES || []).length}</p>
          <p className="text-sm">Tests: {(TESTS || []).length}</p>
        </div>
      </div>
    </div>
  )
}
