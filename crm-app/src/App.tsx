import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import SAList from './pages/SA/SAList'
import CRMList from './pages/CRM/CRMList'
import Customer360 from './pages/Admin/Customer360'
import Dashboard from './pages/Admin/Dashboard'
import ProfilePage from './pages/Profile/ProfilePage'
import UserManagement from './pages/Admin/UserManagement'
import KPIDashboard from './pages/SA/KPIDashboard'
import KPIAdmin from './pages/Admin/KPIAdmin'
import ErrorReport from './pages/Admin/ErrorReport'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  const map: Record<string, string> = { sa: '/sa', sup: '/sa', ccc: '/crm', admin: '/sa' }
  return <Navigate to={map[user.role] || '/sa'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/sa" element={<ProtectedRoute roles={['sa', 'sup', 'admin']}><SAList /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute roles={['ccc', 'admin']}><CRMList /></ProtectedRoute>} />
            <Route path="/customer360" element={<ProtectedRoute roles={['admin']}><Customer360 /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/kpi" element={<ProtectedRoute roles={['sa', 'sup', 'admin']}><KPIDashboard /></ProtectedRoute>} />
            <Route path="/kpi-admin" element={<ProtectedRoute roles={['admin']}><KPIAdmin /></ProtectedRoute>} />
            <Route path="/error-report" element={<ProtectedRoute roles={['admin']}><ErrorReport /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
