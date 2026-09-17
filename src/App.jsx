import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { AuthProvider } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import RequireAccess from './components/auth/RequireAccess'
import RequireAdmin from './components/auth/RequireAdmin'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import PracticeLab from './pages/PracticeLab'
import GameZone from './pages/GameZone'
import Tests from './pages/Tests'
import Revision from './pages/Revision'
import AITutor from './pages/AITutor'
import ProgressPage from './pages/Progress'
import Course from './pages/Course'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Completion from './pages/Completion'
import CertificateView from './pages/CertificateView'
import VerifyCertificate from './pages/VerifyCertificate'
import AdminCertificates from './pages/admin/AdminCertificates'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCurriculum from './pages/admin/AdminCurriculum'
import AdminPayments from './pages/admin/AdminPayments'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'

function Paid({ children }) {
  return <RequireAccess>{children}</RequireAccess>
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/course" element={<Course />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/certificate/:certId" element={<CertificateView />} />

              <Route path="/" element={<Paid><Dashboard /></Paid>} />
              <Route path="/learn" element={<Paid><Learn /></Paid>} />
              <Route path="/learn/:lessonId" element={<Paid><Learn /></Paid>} />
              <Route path="/practice" element={<Paid><PracticeLab /></Paid>} />
              <Route path="/practice/:activityId" element={<Paid><PracticeLab /></Paid>} />
              <Route path="/games" element={<Paid><GameZone /></Paid>} />
              <Route path="/games/:gameId" element={<Paid><GameZone /></Paid>} />
              <Route path="/tests" element={<Paid><Tests /></Paid>} />
              <Route path="/tests/:testId" element={<Paid><Tests /></Paid>} />
              <Route path="/revision" element={<Paid><Revision /></Paid>} />
              <Route path="/revision/:topicId" element={<Paid><Revision /></Paid>} />
              <Route path="/ai-tutor" element={<Paid><AITutor /></Paid>} />
              <Route path="/progress" element={<Paid><ProgressPage /></Paid>} />
              <Route path="/completion" element={<Paid><Completion /></Paid>} />

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="curriculum" element={<AdminCurriculum />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="certificates" element={<AdminCertificates />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  )
}
