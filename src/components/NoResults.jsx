"use client"

const NoResults = ({ onReset }) => {
  return (
    <div className="no-results">
      <div className="no-results-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Ничего не найдено</h3>
      <p>Попробуйте изменить параметры поиска</p>
      <button className="button secondary" onClick={onReset}>
        Сбросить фильтры
      </button>
    </div>
  )
}

export default NoResults
