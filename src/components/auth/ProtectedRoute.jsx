import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAF8F3' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🐾</div>
          <p style={{ fontFamily: 'Nunito', color: '#5B4B8A', fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'walker') return <Navigate to="/walker" replace />
    if (role === 'client') return <Navigate to="/client" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
