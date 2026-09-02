import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import ClientPortal from './components/client/ClientPortal'
import { WalkerDashboard } from './components/walker/WalkerPages'
import AdminPortal from './components/admin/AdminPages'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import TermsOfService from './components/legal/TermsOfService'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#AEE0F5', fontFamily: 'Nunito, sans-serif', color: '#182B4A', fontWeight: 700 }}>
      Loading...
    </div>
  )
}

function AppRoutes() {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/login" element={user ? <Navigate to={`/${role}`} replace /> : <LoginPage />} />
      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />
      <Route path="/client/*" element={<Navigate to="/client" replace />} />
      <Route path="/walker" element={<ProtectedRoute allowedRoles={['walker']}><WalkerDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
      <Route path="/" element={user && role ? <Navigate to={`/${role}`} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={user && role ? <Navigate to={`/${role}`} replace /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}
