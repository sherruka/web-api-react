"use client"

import { useAnime } from "../contexts/AnimeContext"

const AnimeCard = ({ anime, index, viewMode }) => {
  const { showAnimeDetail } = useAnime()

  // Get year from aired date if available
  const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "N/A"

  // Animation delay based on index
  const animationDelay = `${0.05 * (index % 12)}s`

  const handleClick = () => {
    showAnimeDetail(anime)
  }

  if (viewMode === "list") {
    return (
      <div className="anime-card" style={{ animationDelay }} onClick={handleClick}>
        <div className="card-image">
          <img
            src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
            alt={anime.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=280&width=200"
            }}
          />
        </div>
        <div className="card-content">
          <h3 className="card-title">{anime.title}</h3>
          <div className="card-info">
            <div className="card-info-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
              {anime.type || "N/A"}
            </div>
            <div className="card-info-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {year}
            </div>
            {anime.score && (
              <div className="card-info-item card-score">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {anime.score}
              </div>
            )}
            <div className="card-info-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {anime.episodes ? `${anime.episodes} эп.` : "N/A"}
            </div>
          </div>
          <p className="card-synopsis">{anime.synopsis || "Описание отсутствует"}</p>
          <div className="card-genres">
            {anime.genres?.slice(0, 3).map((genre) => (
              <span key={genre.mal_id} className="card-genre">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anime-card" style={{ animationDelay }} onClick={handleClick}>
      <div className="card-image">
        <img
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
          alt={anime.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=280&width=200"
          }}
        />
        <div className="card-overlay"></div>
      </div>
      <div className="card-content">
        <h3 className="card-title">{anime.title}</h3>
        <div className="card-info">
          <div className="card-info-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
            {anime.type || "N/A"}
          </div>
          <div className="card-info-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {year}
          </div>
          {anime.score && (
            <div className="card-info-item card-score">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {anime.score}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnimeCard
