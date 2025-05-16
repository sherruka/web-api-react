"use client"

import { useAnime } from "../contexts/AnimeContext"

const ActiveFilters = () => {
  const {
    searchQuery,
    selectedGenres,
    selectedType,
    selectedStatus,
    yearMin,
    yearMax,
    ratingMin,
    ratingMax,
    selectedSort,
    selectedSortOrder,
    genres,
    removeFilter,
  } = useAnime()

  // Check if there are any active filters
  const hasActiveFilters =
    searchQuery ||
    selectedGenres.length > 0 ||
    selectedType ||
    selectedStatus ||
    yearMin > 1960 ||
    yearMax < new Date().getFullYear() ||
    ratingMin > 0 ||
    ratingMax < 10 ||
    selectedSort !== "score" ||
    selectedSortOrder !== "desc"

  if (!hasActiveFilters) {
    return null
  }

  // Get type text
  const getTypeText = () => {
    const typeOptions = {
      TV: "TV Сериал",
      Movie: "Фильм",
      OVA: "OVA",
      ONA: "ONA",
      Special: "Спешл",
      Music: "Клип",
    }
    return typeOptions[selectedType] || selectedType
  }

  // Get status text
  const getStatusText = () => {
    const statusOptions = {
      Airing: "Выходит",
      Complete: "Завершён",
      Upcoming: "Анонсирован",
    }
    return statusOptions[selectedStatus] || selectedStatus
  }

  // Get sort text
  const getSortText = () => {
    const sortOptions = {
      score: "По рейтингу",
      popularity: "По популярности",
      title: "По названию",
      start_date: "По дате выхода",
      end_date: "По дате завершения",
      episodes: "По кол-ву эпизодов",
    }
    return sortOptions[selectedSort] || selectedSort
  }

  return (
    <div className="active-filters">
      <div className="active-filters-scroll">
        {searchQuery && (
          <FilterTag label="Поиск" value={searchQuery} id="search" onRemove={() => removeFilter("search")} />
        )}

        {selectedGenres.map((genreId) => {
          const genre = genres.find((g) => g.mal_id.toString() === genreId)
          if (genre) {
            return (
              <FilterTag
                key={genreId}
                label="Жанр"
                value={genre.name}
                id={genreId}
                onRemove={() => removeFilter(genreId)}
              />
            )
          }
          return null
        })}

        {selectedType && (
          <FilterTag label="Тип" value={getTypeText()} id="type" onRemove={() => removeFilter("type")} />
        )}

        {selectedStatus && (
          <FilterTag label="Статус" value={getStatusText()} id="status" onRemove={() => removeFilter("status")} />
        )}

        {(yearMin > 1960 || yearMax < new Date().getFullYear()) && (
          <FilterTag label="Год" value={`${yearMin} - ${yearMax}`} id="year" onRemove={() => removeFilter("year")} />
        )}

        {(ratingMin > 0 || ratingMax < 10) && (
          <FilterTag
            label="Рейтинг"
            value={`${ratingMin} - ${ratingMax}`}
            id="rating"
            onRemove={() => removeFilter("rating")}
          />
        )}

        {(selectedSort !== "score" || selectedSortOrder !== "desc") && (
          <FilterTag
            label="Сортировка"
            value={`${getSortText()} ${selectedSortOrder === "desc" ? "↓" : "↑"}`}
            id="sort"
            onRemove={() => removeFilter("sort")}
          />
        )}
      </div>
    </div>
  )
}

const FilterTag = ({ label, value, id, onRemove }) => {
  return (
    <div className="filter-tag">
      <span className="filter-tag-label">{label}:</span>
      <span className="filter-tag-value">{value}</span>
      <button className="filter-tag-remove" onClick={() => onRemove(id)}>
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
  )
}

export default ActiveFilters
