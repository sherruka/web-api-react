"use client"

import { useAnime } from "../contexts/AnimeContext"
import AnimeCard from "./AnimeCard"
import LoadingIndicator from "./LoadingIndicator"
import NoResults from "./NoResults"

const AnimeGrid = () => {
  const { animeList, isFetching, viewMode, setViewModeAndSave, totalResults, error, resetAllFilters } = useAnime()

  const hasNoResults = animeList.length === 0 && !isFetching && !error

  return (
    <>
      <div className="view-options">
        <div className="view-mode">
          <button
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            aria-label="Сетка"
            onClick={() => setViewModeAndSave("grid")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            aria-label="Список"
            onClick={() => setViewModeAndSave("list")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="results-count">
          {isFetching && animeList.length === 0 ? (
            "Загрузка..."
          ) : (
            <>
              Найдено: <span>{totalResults}</span> аниме
            </>
          )}
        </div>
      </div>

      {/* Show initial loading indicator when first loading with no data */}
      {isFetching && animeList.length === 0 && <LoadingIndicator />}

      {/* Show anime grid when we have data */}
      {animeList.length > 0 && (
        <div className={`anime-grid ${viewMode === "list" ? "list-view" : ""}`}>
          {animeList.map((anime, index) => (
            <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Show loading indicator at the bottom when loading more data */}
      {isFetching && animeList.length > 0 && <LoadingIndicator />}

      {/* Show no results message when appropriate */}
      {hasNoResults && <NoResults onReset={resetAllFilters} />}

      {/* Show error message when there's an error */}
      {error && (
        <div className="loading-container">
          <div className="error-message">
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
            <p>{error}</p>
            <button className="button secondary" onClick={() => window.location.reload()}>
              Попробовать снова
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AnimeGrid
