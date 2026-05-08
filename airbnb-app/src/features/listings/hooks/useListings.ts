import { useEffect } from 'react'
import { useStore } from '../../../store/StoreContext'
import { listings as allListings } from '../../../data/listings'

export function useListings(): void {
  const { dispatch } = useStore()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })

    const timer = setTimeout(() => {
      dispatch({ type: 'SET_LISTINGS', payload: allListings })
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 1500)

    return () => clearTimeout(timer)
  }, [dispatch])
}
