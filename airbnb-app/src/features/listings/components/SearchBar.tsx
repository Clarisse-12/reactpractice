import { useRef, useEffect } from 'react'
import { debounce } from 'lodash'
import { FiSearch } from 'react-icons/fi'
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
    <div className="search-bar" role="search" aria-label="Search listings">
      <label className="search-bar__field">
        <FiSearch className="search-bar__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          className="search-bar__input"
          type="text"
          placeholder="Search by title or location..."
          value={state.filter}
          onChange={(event) => handleChange(event.target.value)}
        />
        {state.filter ? (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => dispatch({ type: 'SET_FILTER', payload: '' })}
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
        <button type="button" className="search-bar__btn" aria-label="Search">
          <FiSearch />
          <span>Search</span>
        </button>
      </label>
    </div>
  )
}
