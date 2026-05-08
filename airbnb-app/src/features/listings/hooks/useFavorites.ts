import { useStore } from '../../../store/StoreContext'
import toast from 'react-hot-toast'

export function useFavorites() {
  const { state, dispatch } = useStore()

  const toggle = (id: number, title: string): void => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id })

    if (state.saved.includes(id)) {
      toast.success(`Removed: ${title}`)
    } else {
      toast.success(`Saved: ${title}`)
    }
  }

  const count = state.saved.length
  const isSaved = (id: number): boolean => state.saved.includes(id)

  return { toggle, count, isSaved }
}
