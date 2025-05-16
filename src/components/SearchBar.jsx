"use client"

import { useState, useEffect } from "react"
import { useAnime } from "../contexts/AnimeContext"
import { useDebounce } from "../hooks/useDebounce"

const SearchBar = () => {
  const { searchQuery, handleSearch, clearSearch } = useAnime()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, 500)

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedValue !== searchQuery) {
      handleSearch(debouncedValue)
    }
  }, [debouncedValue, handleSearch, searchQuery])

  // Update input value when searchQuery changes (e.g., when filters are reset)
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleClearClick = () => {
    setInputValue("")
    clearSearch()
  }

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Поиск аниме..."
          aria-label="Поиск аниме"
        />
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <button
          className="search-clear"
          aria-label="Очистить поиск"
          onClick={handleClearClick}
          style={{ opacity: inputValue ? 0.6 : 0 }}
          disabled={!inputValue}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SearchBar
