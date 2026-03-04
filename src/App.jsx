import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import ClientHome from './components/client/Home'
import { ClientBook, ClientDogs, ClientProfile } from './components/client/ClientPages'
import { WalkerDashboard, WalkerHistory } from './components/walker/WalkerPages'
import { AdminDashboard, AdminRequests, AdminSchedule, AdminClients } from './components/admin/AdminPages'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#FAF8F3'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🐾</div>
        <p style={{ fontFamily: 'Nunito, sans-serif', color: '#5B4B8A', fontWeight: 600 }}>
          Loading...
        </p>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { role, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && role) {
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'walker') navigate('/walker', { replace: true })
      else navigate('/client', { replace: true })
    }
  }, [role, loading])
  return null
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <RoleRedirect />} />
      <Route path="/" element={user ? <RoleRedirect /> : <Navigate to="/login" replace />} />
      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientHome /></ProtectedRoute>} />
      <Route path="/client/book" element={<ProtectedRoute allowedRoles={['client']}><ClientBook /></ProtectedRoute>} />
      <Route path="/client/dogs" element={<ProtectedRoute allowedRoles={['client']}><ClientDogs /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>} />
      <Route path="/walker" element={<ProtectedRoute allowedRoles={['walker']}><WalkerDashboard /></ProtectedRoute>} />
      <Route path="/walker/history" element={<ProtectedRoute allowedRoles={['walker']}><WalkerHistory /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequests /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={['admin']}><AdminSchedule /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={['admin']}><AdminClients /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
