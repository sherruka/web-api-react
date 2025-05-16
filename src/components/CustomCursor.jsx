"use client"

import { useState, useEffect } from "react"

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isClickable, setIsClickable] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      // Add clickable class to interactive elements
      const target = e.target
      const isClickableElement =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.closest(".anime-card") ||
        target.closest(".option-item") ||
        target.closest(".filter-tag") ||
        target.closest(".genre-tag")

      setIsClickable(isClickableElement)
    }

    // Only enable custom cursor on desktop
    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (!isMobile) {
      window.addEventListener("mousemove", updateCursor)
    }

    return () => window.removeEventListener("mousemove", updateCursor)
  }, [])

  // Don't render on mobile
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null
  }

  return (
    <>
      <div
        id="cursor"
        className={isClickable ? "clickable" : ""}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isVisible ? 1 : 0,
        }}
      ></div>
      <div
        id="cursor-blur"
        className={isClickable ? "clickable" : ""}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isVisible ? 1 : 0,
        }}
      ></div>
    </>
  )
}

export default CustomCursor
