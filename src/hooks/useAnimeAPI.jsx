"use client"

import { useCallback, useRef } from "react"

// API base URL
const API_BASE_URL = "https://api.jikan.moe/v4"

// Request timeout (in milliseconds)
const REQUEST_TIMEOUT = 15000

// Rate limiting delay (in milliseconds) - Jikan API allows 4 requests per second
const RATE_LIMIT_DELAY = 300

// Maximum number of retries for rate limited requests
const MAX_RETRIES = 3

export const useAnimeAPI = () => {
  // Store active request controllers to allow cancellation
  const activeControllers = useRef(new Map())
  
  // Track the last request time to handle rate limiting
  const lastRequestTime = useRef(0)

  /**
   * Helper function to make API requests with timeout, error handling, and rate limiting
   */
  const fetchWithTimeout = useCallback(async (url, options = {}, retryCount = 0) => {
    // Implement rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime.current
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    // Update last request time
    lastRequestTime.current = Date.now()
    
    // Cancel any existing request with the same URL
    if (activeControllers.current.has(url)) {
      activeControllers.current.get(url).abort()
      activeControllers.current.delete(url)
    }
    
    const controller = new AbortController()
    const { signal } = controller
    
    // Store the controller for potential cancellation
    activeControllers.current.set(url, controller)

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        controller.abort()
        reject(new Error(`Request timed out after ${REQUEST_TIMEOUT}ms`))
      }, REQUEST_TIMEOUT)
    })

    try {
      console.log(`Making API request to: ${url}`)
      
      // Race between fetch and timeout
      const response = await Promise.race([fetch(url, { ...options, signal }), timeoutPromise])

      // Handle rate limiting (HTTP 429)
      if (response.status === 429) {
        activeControllers.current.delete(url)
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Rate limited (429). Retrying in ${RATE_LIMIT_DELAY * 2}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 2))
          return fetchWithTimeout(url, options, retryCount + 1)
        } else {
          throw new Error("Rate limit exceeded. Please try again later.")
        }
      }

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      // Clean up the controller reference
      activeControllers.current.delete(url)
      
      return data
    } catch (error) {
      // Clean up the controller reference
      activeControllers.current.delete(url)
      
      // Rethrow with more context, but don't throw for aborted requests
      if (error.name === "AbortError") {
        console.log("Request was aborted", url)
        throw new Error("Request was aborted")
      }
      
      // Retry on network errors
      if (error.message.includes("NetworkError") && retryCount < MAX_RETRIES) {
        console.log(`Network error. Retrying in ${RATE_LIMIT_DELAY * 2}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 2))
        return fetchWithTimeout(url, options, retryCount + 1)
      }
      
      throw error
    }
  }, [])

  /**
   * Cancel all active requests
   */
  const cancelAllRequests = useCallback(() => {
    activeControllers.current.forEach((controller) => {
      controller.abort()
    })
    activeControllers.current.clear()
  }, [])

  /**
   * Fetch genres from API
   */
  const fetchGenres = useCallback(async () => {
    try {
      const data = await fetchWithTimeout(`${API_BASE_URL}/genres/anime`)

      if (!data || !Array.isArray(data.data)) {
        throw new Error("Invalid genre data format received from API")
      }

      return data.data
    } catch (error) {
      if (error.message === "Request was aborted") {
        return []
      }
      console.error("Error fetching genres:", error)
      throw error
    }
  }, [fetchWithTimeout])

  /**
   * Fetch anime from API with robust error handling
   */
  const fetchAnime = useCallback(
    async ({
      page = 1,
      genres = [],
      type = "",
      status = "",
      sort = "score",
      sortOrder = "desc",
      query = "",
      yearMin = 1960,
      yearMax = new Date().getFullYear(),
      ratingMin = 0,
      ratingMax = 10,
    }) => {
      try {
        // Validate inputs
        if (page < 1) page = 1

        const url = new URL(`${API_BASE_URL}/anime`)

        // Add required parameters
        url.searchParams.set("page", page.toString())
        url.searchParams.set("limit", "24")
        url.searchParams.set("order_by", sort || "score")
        url.searchParams.set("sort", sortOrder || "desc")

        // Add optional parameters only if they have valid values
        if (genres && genres.length > 0) {
          url.searchParams.set("genres", genres.join(","))
        }

        if (type) url.searchParams.set("type", type)
        if (status) url.searchParams.set("status", status)
        if (query && query.trim()) url.searchParams.set("q", query.trim())

        // Year range - only add if they differ from defaults
        if (yearMin > 1960) url.searchParams.set("start_date", `${yearMin}-01-01`)
        if (yearMax < new Date().getFullYear()) url.searchParams.set("end_date", `${yearMax}-12-31`)

        // Rating range - only add if they differ from defaults
        if (ratingMin > 0) url.searchParams.set("min_score", ratingMin.toString())

        const data = await fetchWithTimeout(url.toString())

        // Validate response structure
        if (!data || !data.data || !Array.isArray(data.data) || !data.pagination) {
          throw new Error("Invalid anime data format received from API")
        }

        return {
          data: data.data,
          pagination: data.pagination,
        }
      } catch (error) {
        if (error.message === "Request was aborted") {
          return { data: [], pagination: { has_next_page: false, items: { total: 0 } } }
        }
        console.error("Error fetching anime:", error)
        throw error
      }
    },
    [fetchWithTimeout]
  )

  /**
   * Fetch characters for an anime
   */
  const fetchCharacters = useCallback(
    async (animeId) => {
      if (!animeId) {
        throw new Error("Anime ID is required to fetch characters")
      }

      try {
        console.log(`Fetching characters for anime ID: ${animeId}`)
        const data = await fetchWithTimeout(`${API_BASE_URL}/anime/${animeId}/characters`)

        // Validate response structure
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error("Invalid character data format received from API")
        }

        console.log(`Successfully fetched ${data.data.length} characters`)
        return data.data.slice(0, 12) // Limit to top 12 characters
      } catch (error) {
        if (error.message === "Request was aborted") {
          return []
        }
        console.error(`Error fetching characters for anime ${animeId}:`, error)
        throw error
      }
    },
    [fetchWithTimeout]
  )

  /**
   * Fetch staff for an anime
   */
  const fetchStaff = useCallback(
    async (animeId) => {
      if (!animeId) {
        throw new Error("Anime ID is required to fetch staff")
      }

      try {
        console.log(`Fetching staff for anime ID: ${animeId}`)
        const data = await fetchWithTimeout(`${API_BASE_URL}/anime/${animeId}/staff`)

        // Validate response structure
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error("Invalid staff data format received from API")
        }

        console.log(`Successfully fetched ${data.data.length} staff members`)
        return data.data.slice(0, 12) // Limit to top 12 staff members
      } catch (error) {
        if (error.message === "Request was aborted") {
          return []
        }
        console.error(`Error fetching staff for anime ${animeId}:`, error)
        throw error
      }
    },
    [fetchWithTimeout]
  )

  return {
    fetchGenres,
    fetchAnime,
    fetchCharacters,
    fetchStaff,
    cancelAllRequests
  }
}