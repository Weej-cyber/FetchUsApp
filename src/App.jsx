import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ClientPortal from './components/client/ClientPortal'
import { WalkerDashboard, WalkerSchedule, WalkerHistory } from './components/walker/WalkerPages'
import AdminPortal from './components/admin/AdminPages'

function RolePicker() {
  const { setRole } = useAuth()
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAF8F3', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🐾</div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', color: '#5B4B8A', fontWeight: 700, marginBottom: '8px' }}>FetchUs</h1>
        <p style={{ color: '#636e72', marginBottom: '32px' }}>Select a role to continue</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '260px', margin: '0 auto' }}>
          {[
            { role: 'admin', label: 'Admin', color: '#5B4B8A', path: '/admin' },
            { role: 'walker', label: 'Walker', color: '#2D9B8A', path: '/walker' },
            { role: 'client', label: 'Client', color: '#D4A843', path: '/client' },
          ].map(r => (
            <button
              key={r.role}
              onClick={() => { setRole(r.role); navigate(r.path) }}
              style={{ padding: '14px', borderRadius: '12px', border: 'none', background: r.color, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { role } = useAuth()

  if (!role) return <RolePicker />

  return (
    <Routes>
      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />
      <Route path="/client/*" element={<Navigate to="/client" replace />} />
      <Route path="/walker" element={<ProtectedRoute allowedRoles={['walker']}><WalkerDashboard /></ProtectedRoute>} />
      <Route path="/walker/schedule" element={<ProtectedRoute allowedRoles={['walker']}><WalkerSchedule /></ProtectedRoute>} />
      <Route path="/walker/history" element={<ProtectedRoute allowedRoles={['walker']}><WalkerHistory /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
