"use client"

import { useState, useEffect } from "react"
import { useAnime } from "../contexts/AnimeContext"

const AnimeModal = () => {
  const {
    selectedAnime,
    hideModal,
    activeTab,
    setActiveTabHandler,
    toggleFavorite,
    favorites,
    fetchCharacters,
    fetchStaff,
  } = useAnime()

  const [characters, setCharacters] = useState([])
  const [staff, setStaff] = useState([])
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true)
  const [isLoadingStaff, setIsLoadingStaff] = useState(true)

  useEffect(() => {
    if (!selectedAnime) return

    let isMounted = true

    const loadData = async () => {
      // Load characters
      setIsLoadingCharacters(true)
      try {
        if (selectedAnime.mal_id) {
          const charactersData = await fetchCharacters(selectedAnime.mal_id)
          if (isMounted) {
            setCharacters(charactersData || [])
          }
        } else {
          throw new Error("Missing anime ID")
        }
      } catch (error) {
        console.error("Error loading characters:", error)
        if (isMounted) {
          setCharacters([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingCharacters(false)
        }
      }

      // Load staff
      setIsLoadingStaff(true)
      try {
        if (selectedAnime.mal_id) {
          const staffData = await fetchStaff(selectedAnime.mal_id)
          if (isMounted) {
            setStaff(staffData || [])
          }
        } else {
          throw new Error("Missing anime ID")
        }
      } catch (error) {
        console.error("Error loading staff:", error)
        if (isMounted) {
          setStaff([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingStaff(false)
        }
      }
    }

    loadData()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [selectedAnime, fetchCharacters, fetchStaff])

  if (!selectedAnime) return null

  // Check if anime is in favorites
  const isFavorite = favorites.some((fav) => fav.mal_id === selectedAnime.mal_id)

  // Get year from aired date if available
  const year = selectedAnime.aired?.from ? new Date(selectedAnime.aired.from).getFullYear() : "N/A"

  // Season and year
  const season = selectedAnime.season ? `${capitalizeFirstLetter(selectedAnime.season)} ${year}` : "N/A"

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={hideModal}></div>
      <div className="modal-container">
        <div className="modal-content">
          <button className="close-button" aria-label="Закрыть" onClick={hideModal}>
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

          <div className="modal-header">
            <div className="modal-title-container">
              <h2 className="modal-title">{selectedAnime.title}</h2>
              <div className="modal-title-jp">{selectedAnime.title_japanese || ""}</div>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-sidebar">
              <div className="modal-image-container">
                <img
                  src={selectedAnime.images.jpg.large_image_url || selectedAnime.images.jpg.image_url}
                  alt={selectedAnime.title}
                />
                <div className="image-overlay"></div>
              </div>

              <div className="modal-stats">
                <div className="stat-item">
                  <div className="stat-label">Рейтинг</div>
                  <div className="stat-value score">{selectedAnime.score ? selectedAnime.score.toFixed(2) : "N/A"}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Тип</div>
                  <div className="stat-value">{selectedAnime.type || "N/A"}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Статус</div>
                  <div className="stat-value">{selectedAnime.status || "N/A"}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Эпизоды</div>
                  <div className="stat-value">{selectedAnime.episodes || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="modal-main">
              <div className="tab-container">
                <div className="tabs">
                  <button
                    className={`tab-button ${activeTab === "info" ? "active" : ""}`}
                    data-tab="info"
                    onClick={() => setActiveTabHandler("info")}
                  >
                    Информация
                  </button>
                  <button
                    className={`tab-button ${activeTab === "characters" ? "active" : ""}`}
                    data-tab="characters"
                    onClick={() => setActiveTabHandler("characters")}
                  >
                    Персонажи
                  </button>
                  <button
                    className={`tab-button ${activeTab === "staff" ? "active" : ""}`}
                    data-tab="staff"
                    onClick={() => setActiveTabHandler("staff")}
                  >
                    Создатели
                  </button>
                </div>

                <div className="tab-content">
                  <div className={`tab-pane ${activeTab === "info" ? "active" : ""}`}>
                    <div className="info-section">
                      <h3>Описание</h3>
                      <p className="synopsis">{selectedAnime.synopsis || "Описание отсутствует"}</p>
                    </div>

                    <div className="info-section">
                      <h3>Жанры</h3>
                      <div className="genres-container">
                        {selectedAnime.genres?.length > 0
                          ? selectedAnime.genres.map((genre) => (
                              <span key={genre.mal_id} className="genre-tag">
                                {genre.name}
                              </span>
                            ))
                          : "Жанры не указаны"}
                      </div>
                    </div>

                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">Сезон</div>
                        <div className="info-value">{season}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Год</div>
                        <div className="info-value">{year}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Студия</div>
                        <div className="info-value">
                          {selectedAnime.studios?.length > 0
                            ? selectedAnime.studios.map((studio) => studio.name).join(", ")
                            : "N/A"}
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Источник</div>
                        <div className="info-value">{selectedAnime.source || "N/A"}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Рейтинг</div>
                        <div className="info-value">{selectedAnime.rating || "N/A"}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Длительность</div>
                        <div className="info-value">{selectedAnime.duration || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`tab-pane ${activeTab === "characters" ? "active" : ""}`}>
                    {isLoadingCharacters ? (
                      <div className="loading-placeholder">
                        <div className="loading-circle small"></div>
                        <p>Загрузка персонажей...</p>
                      </div>
                    ) : characters && characters.length > 0 ? (
                      <div className="characters-grid">
                        {characters.map((char) => (
                          <div key={char.character.mal_id} className="character-card">
                            <div className="character-image">
                              <img
                                src={char.character.images?.jpg?.image_url || "/placeholder.svg?height=180&width=120"}
                                alt={char.character.name}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg?height=180&width=120"
                                }}
                              />
                            </div>
                            <div className="character-info">
                              <div className="character-name">{char.character.name || "Неизвестно"}</div>
                              <div className="character-role">{char.role || "Неизвестно"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">Информация о персонажах отсутствует</p>
                    )}
                  </div>

                  <div className={`tab-pane ${activeTab === "staff" ? "active" : ""}`}>
                    {isLoadingStaff ? (
                      <div className="loading-placeholder">
                        <div className="loading-circle small"></div>
                        <p>Загрузка информации о создателях...</p>
                      </div>
                    ) : staff && staff.length > 0 ? (
                      <div className="staff-grid">
                        {staff.map((person) => (
                          <div key={person.person.mal_id} className="staff-card">
                            <div className="staff-image">
                              <img
                                src={person.person.images?.jpg?.image_url || "/placeholder.svg?height=180&width=120"}
                                alt={person.person.name}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg?height=180&width=120"
                                }}
                              />
                            </div>
                            <div className="staff-info">
                              <div className="staff-name">{person.person.name || "Неизвестно"}</div>
                              <div className="staff-role">{person.positions?.join(", ") || "Неизвестно"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">Информация о создателях отсутствует</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <a href={selectedAnime.url || "#"} target="_blank" rel="noopener noreferrer" className="button primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Открыть на MyAnimeList
                </a>
                <button className="button secondary" onClick={toggleFavorite}>
                  {isFavorite ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Удалить из избранного
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Добавить в избранное
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default AnimeModal
