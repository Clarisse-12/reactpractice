import { Navigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { Spinner } from '../shared/components/Spinner'

interface Props {
  children: React.ReactNode
  allowedRole: 'host' | 'guest' | 'admin'
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { state } = useStore()

  if (!state.authReady) return <Spinner />

  if (!state.user) return <Navigate to="/login" replace />

  const role = String(state.user.role || 'guest').toLowerCase()

  if (role !== allowedRole) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    return <Navigate to={role === 'host' ? '/dashboard/overview' : '/listings'} replace />
  }

  return <>{children}</>
}
