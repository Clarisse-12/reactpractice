import { Navigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

interface Props {
  children: React.ReactNode
  allowedRole: 'host' | 'guest'
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { state } = useStore()

  if (!state.user) return <Navigate to="/login" replace />

  const role = String(state.user.role || 'guest').toLowerCase()

  if (role !== allowedRole) {
    return <Navigate to={role === 'host' ? '/dashboard/overview' : '/listings'} replace />
  }

  return <>{children}</>
}
