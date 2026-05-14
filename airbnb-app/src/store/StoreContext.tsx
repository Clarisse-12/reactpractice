import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { storeReducer, initialState } from './reducer'
import type { State, Action } from './types'
import { me } from '../services/api'
import { auth } from '../services/api'

interface StoreContextType {
  state: State
  dispatch: (action: Action) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // fetch current user
      me()
        .then((u) => dispatch({ type: 'SET_USER', payload: u }))
        .catch(() => {
          auth.removeToken()
          dispatch({ type: 'LOGOUT' })
        })
        .finally(() => {
          dispatch({ type: 'SET_AUTH_READY', payload: true })
        })
    } else {
      dispatch({ type: 'SET_AUTH_READY', payload: true })
    }

    const stored = localStorage.getItem('dark_mode')
    if (stored) {
      dispatch({ type: 'SET_DARKMODE', payload: stored === '1' })
    }
  }, [])

  useEffect(() => {
    if (state.darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [state.darkMode])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
