"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { useAnimeAPI } from "../hooks/useAnimeAPI"

const AnimeContext = createContext()

export const useAnime = () => {
  const context = useContext(AnimeContext)
  if (!context) {
    throw new Error("useAnime must be used within an AnimeProvider")
  }
  return context
}

export const AnimeProvider = ({ children }) => {
  // State management
  const [animeList, setAnimeList] = useState([])
  const [page, setPage] = useState(1)
  const [isFetching, setIsFetching] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedType, setSelectedType] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSort, setSelectedSort] = useState("score")
  const [selectedSortOrder, setSelectedSortOrder] = useState("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [yearMin, setYearMin] = useState(1960)
  const [yearMax, setYearMax] = useState(new Date().getFullYear())
  const [ratingMin, setRatingMin] = useState(0)
  const [ratingMax, setRatingMax] = useState(10)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem("viewMode") || "grid"
    }
    return "grid"
  })
  const [genres, setGenres] = useState([])
  const [isFilterPanelActive, setIsFilterPanelActive] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem("favorites") || "[]")
    }
    return []
  })
  const [selectedAnime, setSelectedAnime] = useState(null)
  const [activeTab, setActiveTab] = useState("info")
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Refs to prevent stale closures and break circular dependencies
  const stateRef = useRef({
    animeList,
    page,
    isFetching,
    selectedGenres,
    selectedType,
    selectedStatus,
    selectedSort,
    selectedSortOrder,
    searchQuery,
    yearMin,
    yearMax,
    ratingMin,
    ratingMax,
  })

  // Keep the ref updated with the latest state
  useEffect(() => {
    stateRef.current = {
      animeList,
      page,
      isFetching,
      selectedGenres,
      selectedType,
      selectedStatus,
      selectedSort,
      selectedSortOrder,
      searchQuery,
      yearMin,
      yearMax,
      ratingMin,
      ratingMax,
    }
  }, [
    animeList,
    page,
    isFetching,
    selectedGenres,
    selectedType,
    selectedStatus,
    selectedSort,
    selectedSortOrder,
    searchQuery,
    yearMin,
    yearMax,
    ratingMin,
    ratingMax,
  ])

  const { fetchGenres: fetchGenresAPI, fetchAnime: fetchAnimeAPI, fetchCharacters: fetchCharactersAPI, fetchStaff: fetchStaffAPI, cancelAllRequests } = useAnimeAPI()

  // Initialize filters
  const initializeFilters = useCallback(() => {
    // No DOM manipulation here, just state initialization
  }, [])

  // Update year range
  const updateYearRange = useCallback((min, max) => {
    let newMin = Number.parseInt(min)
    const newMax = Number.parseInt(max)

    // Ensure min doesn't exceed max
    if (newMin > newMax) {
      newMin = newMax
    }

    setYearMin(newMin)
    setYearMax(newMax)
  }, [])

  // Update rating range
  const updateRatingRange = useCallback((min, max) => {
    let newMin = Number.parseFloat(min)
    const newMax = Number.parseFloat(max)

    // Ensure min doesn't exceed max
    if (newMin > newMax) {
      newMin = newMax
    }

    setRatingMin(newMin)
    setRatingMax(newMax)
  }, [])

  // Toggle genre selection
  const toggleGenre = useCallback((genreId) => {
    setSelectedGenres((prev) => {
      const index = prev.indexOf(genreId)
      if (index === -1) {
        return [...prev, genreId]
      } else {
        return prev.filter((id) => id !== genreId)
      }
    })
  }, [])

  // Toggle filter panel
  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelActive((prev) => {
      const newValue = !prev
      if (typeof document !== 'undefined') {
        document.body.style.overflow = newValue ? "hidden" : ""
      }
      return newValue
    })
  }, [])

  // Close filter panel
  const closeFilterPanel = useCallback(() => {
    setIsFilterPanelActive(false)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ""
    }
  }, [])

  // Fetch anime from API - defined first to avoid reference issues
  const fetchAnime = useCallback(
    async (pageToFetch = null) => {
      // Use provided page or current page from state
      const currentPage = pageToFetch !== null ? pageToFetch : stateRef.current.page
      
      // Prevent duplicate requests
      if (stateRef.current.isFetching && currentPage !== 1) return

      // Set loading state
      setIsFetching(true)
      setError(null)

      try {
        // If this is a new search/filter (page 1), clear previous results
        if (currentPage === 1) {
          setAnimeList([])
        }

        const data = await fetchAnimeAPI({
          page: currentPage,
          genres: stateRef.current.selectedGenres,
          type: stateRef.current.selectedType,
          status: stateRef.current.selectedStatus,
          sort: stateRef.current.selectedSort,
          sortOrder: stateRef.current.selectedSortOrder,
          query: stateRef.current.searchQuery,
          yearMin: stateRef.current.yearMin,
          yearMax: stateRef.current.yearMax,
          ratingMin: stateRef.current.ratingMin,
          ratingMax: stateRef.current.ratingMax,
        })

        // Validate response data
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error("Invalid response format from API")
        }

        // Filter by max rating (not available in API)
        let filteredData = data.data
        if (stateRef.current.ratingMax < 10) {
          filteredData = filteredData.filter((anime) => !anime.score || (anime.score <= stateRef.current.ratingMax))
        }

        // Update state based on results
        if (currentPage === 1) {
          setAnimeList(filteredData)
        } else {
          // Avoid duplicates when appending
          setAnimeList((prev) => {
            const uniqueNewAnime = filteredData.filter(
              (anime) => !prev.some((existingAnime) => existingAnime.mal_id === anime.mal_id)
            )
            return [...prev, ...uniqueNewAnime]
          })
        }

        // Update pagination state
        setHasNextPage(data.pagination.has_next_page)
        setTotalResults(data.pagination.items.total || 0)

        // If we got no results on the first page, explicitly set hasNextPage to false
        if (filteredData.length === 0 && currentPage === 1) {
          setHasNextPage(false)
        }
      } catch (error) {
        console.error("Error fetching anime:", error)
        setError(`Не удалось загрузить аниме: ${error.message}. Пожалуйста, попробуйте позже.`)

        // Don't clear existing results on error unless it's the first page
        if (currentPage === 1) {
          setAnimeList([])
          setHasNextPage(false)
        }
      } finally {
        setIsFetching(false)
      }
    },
    [fetchAnimeAPI]
  )

  // Reset and fetch new data
  const resetAndFetch = useCallback(() => {
    // Cancel any ongoing requests
    cancelAllRequests()
    
    // Reset state
    setAnimeList([])
    setPage(1)
    setHasNextPage(true)
    
    // Use a small timeout to ensure state updates before fetching
    setTimeout(() => {
      fetchAnime(1)
    }, 10)
  }, [fetchAnime, cancelAllRequests])

  // Apply filter changes
  const applyFilterChanges = useCallback(
    (type, status, sort, sortOrder) => {
      setSelectedType(type)
      setSelectedStatus(status)
      setSelectedSort(sort)
      setSelectedSortOrder(sortOrder)

      closeFilterPanel()
      resetAndFetch()
    },
    [closeFilterPanel, resetAndFetch]
  )

  // Update active filters display
  const updateActiveFilters = useCallback(() => {
    // This is now handled by the ActiveFilters component
  }, [])

  // Remove filter
  const removeFilter = useCallback(
    (id) => {
      if (id === "type") {
        setSelectedType("")
      } else if (id === "status") {
        setSelectedStatus("")
      } else if (id === "year") {
        setYearMin(1960)
        setYearMax(new Date().getFullYear())
      } else if (id === "rating") {
        setRatingMin(0)
        setRatingMax(10)
      } else if (id === "sort") {
        setSelectedSort("score")
        setSelectedSortOrder("desc")
      } else if (id === "search") {
        setSearchQuery("")
      } else if (typeof id === "string" && id.match(/^\d+$/)) {
        // Remove genre
        setSelectedGenres((prev) => prev.filter((genreId) => genreId !== id))
      }

      resetAndFetch()
    },
    [resetAndFetch]
  )

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSelectedGenres([])
    setSelectedType("")
    setSelectedStatus("")
    setSelectedSort("score")
    setSelectedSortOrder("desc")
    setYearMin(1960)
    setYearMax(new Date().getFullYear())
    setRatingMin(0)
    setRatingMax(10)
    setSearchQuery("")

    closeFilterPanel()
    resetAndFetch()
  }, [closeFilterPanel, resetAndFetch])

  // Handle search
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query)
      resetAndFetch()
    },
    [resetAndFetch]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("")
    resetAndFetch()
  }, [resetAndFetch])

  // Set view mode
  const setViewModeAndSave = useCallback((mode) => {
    setViewMode(mode)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("viewMode", mode)
    }
  }, [])

  // Fetch genres from API
  const fetchGenres = useCallback(async () => {
    try {
      const data = await fetchGenresAPI()
      setGenres(data)
    } catch (error) {
      console.error("Error fetching genres:", error)
      setError("Не удалось загрузить жанры. Пожалуйста, попробуйте позже.")
    }
  }, [fetchGenresAPI])

  // Load more anime when scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Don't do anything if we're already fetching or there's no next page
      if (stateRef.current.isFetching || !hasNextPage) return
      
      // Calculate if we're near the bottom of the page
      const scrollPosition = window.innerHeight + window.scrollY
      const scrollThreshold = document.body.offsetHeight - 500

      // Only fetch more if:
      // 1. We're near the bottom
      // 2. We're not already fetching
      // 3. There are more pages to fetch
      // 4. We have at least some results already
      if (scrollPosition >= scrollThreshold && !stateRef.current.isFetching && hasNextPage && animeList.length > 0) {
        setPage((prevPage) => prevPage + 1)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [hasNextPage, animeList.length])

  // Fetch anime when page changes
  useEffect(() => {
    if (page > 1 && isInitialized) {
      fetchAnime(page)
    }
  }, [page, fetchAnime, isInitialized])

  // Initialize the app on mount
  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        try {
          await fetchGenres()
          await fetchAnime(1)
          setIsInitialized(true)
        } catch (error) {
          console.error("Error initializing app:", error)
          setError("Не удалось инициализировать приложение. Пожалуйста, перезагрузите страницу.")
          setIsInitialized(true) // Still mark as initialized to prevent loops
        }
      }
    }
    
    initialize()
    
    // Cleanup function to cancel any pending requests when unmounting
    return () => {
      cancelAllRequests()
    }
  }, [fetchGenres, fetchAnime, isInitialized, cancelAllRequests])

  // Show anime detail in modal
  const showAnimeDetail = useCallback((anime) => {
    setSelectedAnime(anime)
    setActiveTab("info")
    if (typeof document !== 'undefined') {
      document.body.style.overflow = "hidden" // Prevent scrolling
    }
  }, [])

  // Hide modal
  const hideModal = useCallback(() => {
    setSelectedAnime(null)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = "" // Restore scrolling
    }
  }, [])

  // Set active tab
  const setActiveTabHandler = useCallback((tabId) => {
    setActiveTab(tabId)
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback(() => {
    if (!selectedAnime) return

    const animeId = selectedAnime.mal_id
    
    setFavorites((prev) => {
      const isFavorite = prev.some((fav) => fav.mal_id === animeId)
      let newFavorites;
      
      if (isFavorite) {
        // Remove from favorites
        newFavorites = prev.filter((fav) => fav.mal_id !== animeId)
      } else {
        // Add to favorites
        const favoriteAnime = {
          mal_id: selectedAnime.mal_id,
          title: selectedAnime.title,
          image_url: selectedAnime.images?.jpg?.image_url || "",
          type: selectedAnime.type,
          score: selectedAnime.score,
        }
        newFavorites = [...prev, favoriteAnime]
      }
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("favorites", JSON.stringify(newFavorites))
      }
      return newFavorites
    })
  }, [selectedAnime])

  // Fetch characters
  const fetchCharacters = useCallback(
    async (animeId) => {
      if (!animeId) {
        console.error("Missing anime ID for fetchCharacters")
        return []
      }
      
      try {
        console.log("Fetching characters for anime ID:", animeId)
        const data = await fetchCharactersAPI(animeId)
        console.log("Characters data received:", data ? data.length : 0)
        return data || []
      } catch (error) {
        console.error("Error fetching characters:", error)
        throw error // Propagate the error to be handled by the component
      }
    },
    [fetchCharactersAPI]
  )

  // Fetch staff
  const fetchStaff = useCallback(
    async (animeId) => {
      if (!animeId) {
        console.error("Missing anime ID for fetchStaff")
        return []
      }
      
      try {
        console.log("Fetching staff for anime ID:", animeId)
        const data = await fetchStaffAPI(animeId)
        console.log("Staff data received:", data ? data.length : 0)
        return data || []
      } catch (error) {
        console.error("Error fetching staff:", error)
        throw error // Propagate the error to be handled by the component
      }
    },
    [fetchStaffAPI]
  )

  const value = {
    animeList,
    page,
    isFetching,
    hasNextPage,
    selectedGenres,
    selectedType,
    selectedStatus,
    selectedSort,
    selectedSortOrder,
    searchQuery,
    yearMin,
    yearMax,
    ratingMin,
    ratingMax,
    viewMode,
    genres,
    isFilterPanelActive,
    favorites,
    selectedAnime,
    activeTab,
    totalResults,
    error,
    isInitialized,
    initializeFilters,
    updateYearRange,
    updateRatingRange,
    toggleGenre,
    toggleFilterPanel,
    closeFilterPanel,
    applyFilterChanges,
    updateActiveFilters,
    removeFilter,
    resetAllFilters,
    handleSearch,
    clearSearch,
    setViewModeAndSave,
    resetAndFetch,
    fetchGenres,
    fetchAnime,
    showAnimeDetail,
    hideModal,
    setActiveTabHandler,
    toggleFavorite,
    fetchCharacters,
    fetchStaff,
  }

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>
}