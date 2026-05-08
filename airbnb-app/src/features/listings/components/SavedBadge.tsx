import { useStore } from '../../../store/StoreContext'

export function SavedBadge() {
  const { state } = useStore()
  const count = state.saved.length

  return (
    <p className="listing-page__count">
      ❤️ {count} saved{count === 1 ? '' : 's'}
    </p>
  )
}
