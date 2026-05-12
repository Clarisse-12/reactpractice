import { useEffect } from 'react'
import { useStore } from '../../../store/StoreContext'
import { getListings } from '../../../services/api'

export function useListings(): void {
  const { dispatch } = useStore()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    getListings()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data || []
        dispatch({ type: 'SET_LISTINGS', payload: data })
      })
      .catch(() => dispatch({ type: 'SET_LISTINGS', payload: [] }))
      .finally(() => dispatch({ type: 'SET_LOADING', payload: false }))
  }, [dispatch])
}
