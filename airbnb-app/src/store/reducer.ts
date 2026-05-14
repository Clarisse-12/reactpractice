import type { State, Action } from './types'

export const initialState: State = {
  listings: [],
  loading: false,
  filter: '',
  saved: [],
  user: null,
  darkMode: false,
  authReady: false,
}

export function storeReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        saved: state.saved.includes(action.payload)
          ? state.saved.filter((id) => id !== action.payload)
          : [...state.saved, action.payload],
      }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'SET_DARKMODE':
      return { ...state, darkMode: action.payload }
    case 'SET_AUTH_READY':
      return { ...state, authReady: action.payload }
    default:
      return state
  }
}
