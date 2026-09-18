import { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as authStore from '../../services/authStore'
import { LEVELS } from '../../data/levels'

export default function AdminAnalytics() {
  const { user } = useAuth()
  const stats = useMemo(() => authStore.getAdminStats(user), [user])
  const orders = useMemo(() => authStore.listAllOrders(user).orders || [], [user])
  const users = useMemo(() => authStore.listAllUsers(user).users || [], [user])

  const totalLessons = LEVELS.reduce((n, l) => n + l.lessons.length, 0)
  const paid = orders.filter((o) => o.status === 'paid').length
  const engagement = users.filter((u) => u.membership).length

  return (
    <div>
      <h2 className="card-title mb-3">Analytics</h2>
      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Enrollment</h3>
          <p className="text-sm">Students: {stats.totalStudents}</p>
          <p className="text-sm">Active access: {stats.activeStudents}</p>
          <p className="text-sm">Paid orders: {paid}</p>
          <p className="text-sm">With membership record: {engagement}</p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Curriculum size</h3>
          <p className="text-sm">Levels: {LEVELS.length}</p>
          <p className="text-sm">Lessons defined: {totalLessons}</p>
          <p className="text-sm text-muted mt-2">
            Per-student XP, lesson completion, weak topics and test averages are stored on each
            learner device in this build. Aggregate learning analytics require server-side progress
            sync (not enabled yet).
          </p>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Payment mix</h3>
        <p className="text-sm">Paid {stats.paid} · Pending {stats.pending} · Failed {stats.failed} · Cancelled {stats.cancelled}</p>
      </div>
    </div>
  )
}
