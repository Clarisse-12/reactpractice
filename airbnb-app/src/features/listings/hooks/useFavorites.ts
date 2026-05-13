import { useStore } from '../../../store/StoreContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useFavorites() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  const toggle = (id: string, title: string): void => {
    if (!state.user) {
      toast.error('Please sign in to save listings')
      navigate('/login')
      return
    }
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id })
    if (state.saved.includes(id)) {
      toast.success(`Removed: ${title}`)
    } else {
      toast.success(`Saved: ${title}`)
    }
  }

  const count = state.saved.length
  const isSaved = (id: string): boolean => state.saved.includes(id)

  return { toggle, count, isSaved }
}
