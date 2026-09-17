import { useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import QuestHelperButton from '../helper/QuestHelperButton'
import QuestHelperPanel from '../helper/QuestHelperPanel'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helperOpen, setHelperOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar
          pathname={location.pathname}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
      <QuestHelperButton onClick={() => setHelperOpen(true)} />
      <QuestHelperPanel open={helperOpen} onClose={() => setHelperOpen(false)} />
    </div>
  )
}
