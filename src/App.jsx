"use client"

import { useEffect, useState } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import FilterPanel from "./components/FilterPanel"
import ActiveFilters from "./components/ActiveFilters"
import AnimeGrid from "./components/AnimeGrid"
import AnimeModal from "./components/AnimeModal"
import ToTopButton from "./components/ToTopButton"
import CustomCursor from "./components/CustomCursor"
import ParticlesBackground from "./components/ParticlesBackground"
import { useAnime } from "./contexts/AnimeContext"
import { useTheme } from "./contexts/ThemeContext"

function App() {
  const {
    isFilterPanelActive,
    closeFilterPanel,
    selectedAnime,
    hideModal,
    fetchGenres,
    initializeFilters,
    updateActiveFilters,
    fetchAnime,
  } = useAnime()

  const { isDarkTheme } = useTheme()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        await fetchGenres()

        initializeFilters()
        updateActiveFilters()

        await fetchAnime(1)

        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing app:", error)
        setIsInitialized(true)
      }
    }

    init()
  }, [fetchGenres, initializeFilters, updateActiveFilters, fetchAnime])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedAnime) {
          hideModal()
        } else if (isFilterPanelActive) {
          closeFilterPanel()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedAnime, isFilterPanelActive, hideModal, closeFilterPanel])

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark-theme")
    } else {
      document.body.classList.remove("dark-theme")
    }
  }, [isDarkTheme])

  return (
    <>
      <CustomCursor />
      <ParticlesBackground />

      <Header />
      <SearchBar />
      <FilterPanel />
      <ActiveFilters />

      <main className="main-content">
        <AnimeGrid />
      </main>

      {selectedAnime && <AnimeModal />}
      <ToTopButton />
    </>
  )
}

export default App
