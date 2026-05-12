import { useEffect } from 'react'
import { useStore } from '../../../store/StoreContext'
import { getListings } from '../../../services/api'

interface Filters {
  type?: string
  maxPrice?: string
  location?: string
}

export function useListings(filters?: Filters): void {
  const { dispatch } = useStore()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    getListings(filters)
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data || []
        dispatch({ type: 'SET_LISTINGS', payload: data })
      })
      .catch(() => dispatch({ type: 'SET_LISTINGS', payload: [] }))
      .finally(() => dispatch({ type: 'SET_LOADING', payload: false }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters?.type, filters?.maxPrice, filters?.location])
}
