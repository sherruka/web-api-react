"use client"

import { useState, useEffect } from "react"
import { useAnime } from "../contexts/AnimeContext"

const FilterPanel = () => {
  const {
    isFilterPanelActive,
    closeFilterPanel,
    genres,
    selectedGenres,
    toggleGenre,
    selectedType,
    selectedStatus,
    selectedSort,
    selectedSortOrder,
    yearMin,
    yearMax,
    ratingMin,
    ratingMax,
    applyFilterChanges,
    resetAllFilters,
    updateYearRange,
    updateRatingRange,
  } = useAnime()

  const [localType, setLocalType] = useState(selectedType)
  const [localStatus, setLocalStatus] = useState(selectedStatus)
  const [localSort, setLocalSort] = useState(selectedSort)
  const [localSortOrder, setLocalSortOrder] = useState(selectedSortOrder)
  const [localYearMin, setLocalYearMin] = useState(yearMin)
  const [localYearMax, setLocalYearMax] = useState(yearMax)
  const [localRatingMin, setLocalRatingMin] = useState(ratingMin)
  const [localRatingMax, setLocalRatingMax] = useState(ratingMax)
  const [isGenreDropdownActive, setIsGenreDropdownActive] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setLocalType(selectedType)
    setLocalStatus(selectedStatus)
    setLocalSort(selectedSort)
    setLocalSortOrder(selectedSortOrder)
    setLocalYearMin(yearMin)
    setLocalYearMax(yearMax)
    setLocalRatingMin(ratingMin)
    setLocalRatingMax(ratingMax)
  }, [selectedType, selectedStatus, selectedSort, selectedSortOrder, yearMin, yearMax, ratingMin, ratingMax])

  // Handle year range change
  const handleYearMinChange = (e) => {
    const value = Number.parseInt(e.target.value)
    setLocalYearMin(value)
    if (value > localYearMax) {
      setLocalYearMax(value)
    }
  }

  const handleYearMaxChange = (e) => {
    const value = Number.parseInt(e.target.value)
    setLocalYearMax(value)
    if (value < localYearMin) {
      setLocalYearMin(value)
    }
  }

  // Handle rating range change
  const handleRatingMinChange = (e) => {
    const value = Number.parseFloat(e.target.value)
    setLocalRatingMin(value)
    if (value > localRatingMax) {
      setLocalRatingMax(value)
    }
  }

  const handleRatingMaxChange = (e) => {
    const value = Number.parseFloat(e.target.value)
    setLocalRatingMax(value)
    if (value < localRatingMin) {
      setLocalRatingMin(value)
    }
  }

  // Apply filters
  const handleApplyFilters = () => {
    updateYearRange(localYearMin, localYearMax)
    updateRatingRange(localRatingMin, localRatingMax)
    applyFilterChanges(localType, localStatus, localSort, localSortOrder)
  }

  // Toggle genre dropdown
  const toggleGenreDropdown = () => {
    setIsGenreDropdownActive(!isGenreDropdownActive)
  }

  // Calculate range slider styles
  const yearRangeStyle = {
    left: `${((localYearMin - 1960) / (new Date().getFullYear() - 1960)) * 100}%`,
    width: `${((localYearMax - localYearMin) / (new Date().getFullYear() - 1960)) * 100}%`,
  }

  const ratingRangeStyle = {
    left: `${(localRatingMin / 10) * 100}%`,
    width: `${((localRatingMax - localRatingMin) / 10) * 100}%`,
  }

  return (
    <div className={`filter-panel ${isFilterPanelActive ? "active" : ""}`}>
      <div className="filter-header">
        <h2>Расширенные фильтры</h2>
        <button className="close-button" aria-label="Закрыть фильтры" onClick={closeFilterPanel}>
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

      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="genreSelect">Жанры</label>
          <div className="multi-select-wrapper">
            <div className={`multi-select ${isGenreDropdownActive ? "active" : ""}`} onClick={toggleGenreDropdown}>
              <div className="selected-options">
                {selectedGenres.length === 0 ? (
                  <span className="placeholder">Выберите жанры</span>
                ) : (
                  selectedGenres.map((genreId) => {
                    const genre = genres.find((g) => g.mal_id.toString() === genreId)
                    return genre ? (
                      <div key={genreId} className="selected-option">
                        {genre.name}
                        <button
                          className="remove-option"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleGenre(genreId)
                          }}
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
                    ) : null
                  })
                )}
              </div>
              <div className="dropdown-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            <div className={`options-dropdown ${isGenreDropdownActive ? "active" : ""}`}>
              {genres.map((genre) => (
                <div
                  key={genre.mal_id}
                  className={`option-item ${selectedGenres.includes(genre.mal_id.toString()) ? "selected" : ""}`}
                  onClick={() => toggleGenre(genre.mal_id.toString())}
                >
                  <div className="option-checkbox">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="option-label">{genre.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="yearRange">Год выпуска</label>
          <div className="range-slider-container">
            <div className="range-values">
              <span>{localYearMin}</span>
              <span>{localYearMax}</span>
            </div>
            <div className="range-slider">
              <input
                type="range"
                id="yearMinInput"
                min="1960"
                max={new Date().getFullYear()}
                value={localYearMin}
                onChange={handleYearMinChange}
                className="range-input min-range"
              />
              <input
                type="range"
                id="yearMaxInput"
                min="1960"
                max={new Date().getFullYear()}
                value={localYearMax}
                onChange={handleYearMaxChange}
                className="range-input max-range"
              />
              <div className="range-track"></div>
              <div className="range-progress" style={yearRangeStyle}></div>
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="typeSelect">Тип</label>
          <div className="select-wrapper">
            <select id="typeSelect" value={localType} onChange={(e) => setLocalType(e.target.value)}>
              <option value="">Все типы</option>
              <option value="TV">TV Сериал</option>
              <option value="Movie">Фильм</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="Special">Спешл</option>
              <option value="Music">Клип</option>
            </select>
            <div className="select-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="statusSelect">Статус</label>
          <div className="select-wrapper">
            <select id="statusSelect" value={localStatus} onChange={(e) => setLocalStatus(e.target.value)}>
              <option value="">Все статусы</option>
              <option value="Airing">Выходит</option>
              <option value="Complete">Завершён</option>
              <option value="Upcoming">Анонсирован</option>
            </select>
            <div className="select-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="ratingRange">Рейтинг</label>
          <div className="range-slider-container">
            <div className="range-values">
              <span>{localRatingMin}</span>
              <span>{localRatingMax}</span>
            </div>
            <div className="range-slider">
              <input
                type="range"
                id="ratingMinInput"
                min="0"
                max="10"
                step="0.1"
                value={localRatingMin}
                onChange={handleRatingMinChange}
                className="range-input min-range"
              />
              <input
                type="range"
                id="ratingMaxInput"
                min="0"
                max="10"
                step="0.1"
                value={localRatingMax}
                onChange={handleRatingMaxChange}
                className="range-input max-range"
              />
              <div className="range-track"></div>
              <div className="range-progress" style={ratingRangeStyle}></div>
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="sortSelect">Сортировка</label>
          <div className="select-wrapper">
            <select id="sortSelect" value={localSort} onChange={(e) => setLocalSort(e.target.value)}>
              <option value="score">По рейтингу</option>
              <option value="popularity">По популярности</option>
              <option value="title">По названию</option>
              <option value="start_date">По дате выхода</option>
              <option value="end_date">По дате завершения</option>
              <option value="episodes">По кол-ву эпизодов</option>
            </select>
            <div className="select-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="sortOrderSelect">Порядок</label>
          <div className="select-wrapper">
            <select id="sortOrderSelect" value={localSortOrder} onChange={(e) => setLocalSortOrder(e.target.value)}>
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
            <div className="select-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-actions">
        <button className="button secondary" onClick={resetAllFilters}>
          Сбросить
        </button>
        <button className="button primary" onClick={handleApplyFilters}>
          Применить
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
