"use client"

import { useAnime } from "../contexts/AnimeContext"
import { useTheme } from "../contexts/ThemeContext"

const Header = () => {
  const { toggleFilterPanel } = useAnime()
  const { isDarkTheme, toggleTheme } = useTheme()

  return (
    <header className="main-header">
      <div className="logo-container">
        <div className="logo-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <h1 className="logo-text">
          Anime<span>Verse</span>
        </h1>
      </div>

      <div className="header-controls">
        <button className="icon-button" aria-label="Показать фильтры" onClick={toggleFilterPanel}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Фильтры</span>
        </button>

        <button className="icon-button" aria-label="Переключить тему" onClick={toggleTheme}>
          <svg
            className="sun-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            className="moon-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Header
