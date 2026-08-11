"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks"

interface UseCarouselScrollOptions {
  itemCount: number
}

interface UseCarouselScrollResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  canScrollLeft: boolean
  canScrollRight: boolean
  cardWidth: number
  containerWidth: number
  activeDot: number
  totalDots: number
  scrollBy: (direction: "left" | "right") => void
  scrollToDot: (index: number) => void
}

const CARD_GAP = 16
const SCROLL_THRESHOLD = 5

export function useCarouselScroll({
  itemCount,
}: UseCarouselScrollOptions): UseCarouselScrollResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [cardWidth, setCardWidth] = useState(320)
  const [containerWidth, setContainerWidth] = useState(0)
  const [activeDot, setActiveDot] = useState(0)

  const isMobile = useMediaQuery("(max-width: 639px)")
  const isTablet = useMediaQuery("(max-width: 1023px)")

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 320
    if (isMobile) return window.innerWidth - 48
    if (isTablet) return (window.innerWidth - 48) / 2
    return (window.innerWidth - 64) / 3
  }, [isMobile, isTablet])

  useEffect(() => {
    const updateCardWidth = () => {
      const baseWidth = getCardWidth()
      setCardWidth(baseWidth + CARD_GAP)
    }

    updateCardWidth()
    window.addEventListener("resize", updateCardWidth)
    return () => window.removeEventListener("resize", updateCardWidth)
  }, [getCardWidth])

  const checkScrollability = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > SCROLL_THRESHOLD)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - SCROLL_THRESHOLD)

    const visibleCards = Math.floor(clientWidth / (cardWidth - CARD_GAP)) || 1
    const dot = Math.max(
      0,
      Math.min(
        Math.floor(scrollLeft / (cardWidth - CARD_GAP)),
        Math.max(0, itemCount - visibleCards)
      )
    )
    setActiveDot(dot)
  }, [cardWidth, itemCount])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener("scroll", checkScrollability)
    return () => container.removeEventListener("scroll", checkScrollability)
  }, [checkScrollability])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const container = containerRef.current
      if (!container) return
      const amount = direction === "left" ? -cardWidth + CARD_GAP : cardWidth - CARD_GAP
      container.scrollBy({ left: amount, behavior: "smooth" })
    },
    [cardWidth]
  )

  const scrollToDot = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container) return
      container.scrollTo({
        left: index * (cardWidth - CARD_GAP),
        behavior: "smooth",
      })
    },
    [cardWidth]
  )

  const totalDots =
    containerWidth > 0
      ? Math.max(1, Math.ceil(itemCount - Math.floor(containerWidth / (cardWidth - CARD_GAP)) + 1))
      : 1

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    cardWidth,
    containerWidth,
    activeDot,
    totalDots,
    scrollBy,
    scrollToDot,
  }
}