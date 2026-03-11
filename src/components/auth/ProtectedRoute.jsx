import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useAuth()

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'walker') return <Navigate to="/walker" replace />
    if (role === 'client') return <Navigate to="/client" replace />
    return <Navigate to="/" replace />
  }

  return children
}
