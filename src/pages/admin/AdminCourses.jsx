import { LEVELS } from '../../data/levels'
import { COURSE } from '../../config/course'

export default function AdminCourses() {
  return (
    <div>
      <h2 className="card-title mb-3">Courses</h2>
      <div className="card mb-4">
        <h3 className="font-semibold">{COURSE.name}</h3>
        <p className="text-sm text-muted mt-1">{COURSE.tagline || COURSE.description}</p>
        <p className="text-sm mt-2">Price: ₹{(COURSE.price / 100).toLocaleString('en-IN')}</p>
        <p className="text-sm">Duration access: {COURSE.accessDays || 365} days</p>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Levels ({LEVELS.length})</h3>
        {LEVELS.map((lv) => (
          <div key={lv.id} className="text-sm mb-2" style={{ borderBottom: '1px solid var(--cq-border)', paddingBottom: 6 }}>
            <strong>Level {lv.id}: {lv.title}</strong>
            <div className="text-muted">{lv.description}</div>
            <div>{lv.lessons?.length || 0} lessons</div>
          </div>
        ))}
      </div>
    </div>
  )
}
