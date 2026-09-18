import { useParams, Link } from 'react-router-dom'
import {
  FlaskConical,
  CheckCircle,
} from '../components/ui/Icons'
import { PRACTICE_CATEGORIES, PRACTICE_ACTIVITIES, getActivityById } from '../data/practice'
import { useProgress } from '../context/ProgressContext'
import PracticeShell from '../components/practice/PracticeShell'
import HardwareID from '../components/practice/HardwareID'
import KeyboardPractice from '../components/practice/KeyboardPractice'
import MousePractice from '../components/practice/MousePractice'
import DesktopSim from '../components/practice/DesktopSim'
import FileManager from '../components/practice/FileManager'
import EmailCompose from '../components/practice/EmailCompose'
import WordPractice from '../components/practice/WordPractice'
import ExcelPractice from '../components/practice/ExcelPractice'
import PowerPointPractice from '../components/practice/PowerPointPractice'
import PhishingPractice from '../components/practice/PhishingPractice'
import DownloadUpload from '../components/practice/DownloadUpload'
import ZipPractice from '../components/practice/ZipPractice'
import SettingsPractice from '../components/practice/SettingsPractice'
import DesignPractice from '../components/practice/DesignPractice'
import CodeBlocksPractice from '../components/practice/CodeBlocksPractice'
import PromptPractice from '../components/practice/PromptPractice'

const COMPONENT_MAP = {
  'hardware-id': HardwareID,
  'keyboard': KeyboardPractice,
  'mouse': MousePractice,
  'desktop': DesktopSim,
  'file-manager': FileManager,
  'email': EmailCompose,
  'word': WordPractice,
  'excel': ExcelPractice,
  'powerpoint': PowerPointPractice,
  'phishing': PhishingPractice,
  'download-upload': DownloadUpload,
  'zip': ZipPractice,
  'settings': SettingsPractice,
  'design': DesignPractice,
  'code-blocks': CodeBlocksPractice,
  'prompt': PromptPractice,
}

export default function PracticeLab() {
  const { activityId } = useParams()
  const { isPracticeCompleted, completePractice } = useProgress()

  if (activityId) {
    const activity = getActivityById(activityId)
    const Comp = COMPONENT_MAP[activityId] || COMPONENT_MAP[activity?.component]
    if (!activity) {
      return (
        <div className="card">
          <p>Activity not found.</p>
          <Link to="/practice" className="btn btn-secondary mt-3">All practice</Link>
        </div>
      )
    }
    return (
      <PracticeShell
        activity={activity}
        completed={isPracticeCompleted(activityId)}
        onComplete={(score, total, xp) => completePractice(activityId, score, total, xp)}
      >
        {Comp ? <Comp activity={activity} /> : <p className="text-sm text-muted">Practice module loading…</p>}
      </PracticeShell>
    )
  }

  const activities = PRACTICE_ACTIVITIES || []
  const categories = PRACTICE_CATEGORIES || []

  return (
    <div>
      <p className="text-muted mb-4 text-sm">
        Hands-on practice simulations. Complete activities to earn XP and build skills.
      </p>
      {categories.map((cat) => {
        const items = activities.filter((a) => a.category === cat.id)
        if (items.length === 0) return null
        return (
          <div key={cat.id} className="mb-4">
            <h3 className="card-title mb-2">{cat.title}</h3>
            <div className="grid-2">
              {items.map((a) => {
                const done = isPracticeCompleted(a.id)
                return (
                  <Link key={a.id} to={`/practice/${a.id}`} className="card practice-card">
                    <div className="flex items-center gap-2 mb-1">
                      {done ? <CheckCircle size={18} color="#10b981" /> : <FlaskConical size={18} color="#4f46e5" />}
                      <span className="font-semibold">{a.title}</span>
                    </div>
                    <p className="text-sm text-muted">{a.description}</p>
                    <span className="badge badge-warning mt-2">+{a.xpReward || 20} XP</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
      {activities.length === 0 && (
        <div className="card page-placeholder">
          <p className="text-muted">Practice activities coming soon.</p>
        </div>
      )}
    </div>
  )
}
