"use client"

import { useCallback, useRef, useState } from "react"

interface UseCarouselDragResult {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  isDragging: boolean
  resetDrag: () => void
}

export function useCarouselDrag(): UseCarouselDragResult {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const scrollStartRef = useRef(0)

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      startXRef.current = e.touches[0].clientX
      scrollStartRef.current = e.currentTarget.scrollLeft
    },
    []
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const diff = startXRef.current - e.touches[0].clientX
      e.currentTarget.scrollLeft = scrollStartRef.current + diff
    },
    [isDragging]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      setIsDragging(false)
      const diff = startXRef.current - e.changedTouches[0].clientX

      if (Math.abs(diff) > 5) {
        e.currentTarget.scrollBy({
          left: diff * 0.3,
          behavior: "auto",
        })
      }
    },
    [isDragging]
  )

  const resetDrag = useCallback(() => setIsDragging(false), [])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isDragging,
    resetDrag,
  }
}