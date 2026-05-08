import { useRef, useEffect } from 'react'
import { debounce } from 'lodash'
import { useStore } from '../../../store/StoreContext'

export function SearchBar() {
  const { dispatch, state } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useRef(
    debounce((value: string) => {
      dispatch({ type: 'SET_FILTER', payload: value })
    }, 300)
  ).current

  useEffect(() => {
    return () => {
      handleChange.cancel()
    }
  }, [handleChange])

  return (
    <label className="search-bar">
      <span className="search-bar__label">Search</span>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        placeholder="Search by title or location"
        value={state.filter}
        onChange={(event) => handleChange(event.target.value)}
      />
    </label>
  )
}
