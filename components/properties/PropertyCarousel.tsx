"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  isValidElement,
  Children,
} from "react"
import { ChevronLeft, ChevronRight, Loader2, Home, AlertCircle, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PropertyCard, Skeleton as PropertyCardSkeleton } from "./PropertyCard"
import { useIntersectionObserver, useReducedMotion, useMediaQuery } from "@/hooks"
import { Button } from "components/ui/button"
import { cn } from "lib/utils"

interface Property {
  id: number
  name: string
  description: string
  country: { name: string }
  city: { name: string }
  type_of_contract: string
  property_type: string
  rooms: number
  bathrooms: number
  area: string
  price: string
  formatted_price: string
  status: string
  main_image: string
  main_image_thumb: string
  publisher: { id: number; name: string; email: string }
  is_new?: boolean
  is_reduced?: boolean
}

interface PropertyCarouselProps {
  properties: Property[]
  title?: string
  loading?: boolean
  skeletonCount?: number
  onRefresh?: () => Promise<void> | void
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  error?: Error | null
  onRetry?: () => void
}

function EmptyState({
  title = "No Properties Found",
  description = "There are no properties available at the moment. Check back later or create a new property listing.",
  actionLabel,
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Home className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} aria-label={actionLabel}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
}: {
  error?: Error | null
  onRetry?: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
        <AlertCircle
          className="h-12 w-12 text-red-500"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {error?.message || "Unable to load properties. Please try again."}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          aria-label="Retry loading properties"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

function SkeletonCarousel({ count = 4 }: { count?: number }) {
  const skeletons = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

  return (
    <div className="flex gap-4 overflow-hidden" role="status" aria-label="Loading properties">
      {skeletons.map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PropertyCarousel({
  properties,
  title,
  loading = false,
  skeletonCount = 4,
  onRefresh,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  error,
  onRetry,
}: PropertyCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [cardWidth, setCardWidth] = useState(320)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollStart, setScrollStart] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeDot, setActiveDot] = useState(0)
  const [announcement, setAnnouncement] = useState("")

  const prefersReducedMotion = useReducedMotion()
  const isMobile = useMediaQuery("(max-width: 639px)")
  const isTablet = useMediaQuery("(max-width: 1023px)")

  const { ref: containerIntersectionRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "200px",
  })

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 320
    if (isMobile) return window.innerWidth - 48
    if (isTablet) return (window.innerWidth - 48) / 2
    return (window.innerWidth - 64) / 3
  }, [isMobile, isTablet])

  useEffect(() => {
    const updateCardWidth = () => {
      const baseWidth = getCardWidth()
      const gap = 16
      setCardWidth(baseWidth + gap)
    }

    updateCardWidth()
    window.addEventListener("resize", updateCardWidth)
    return () => window.removeEventListener("resize", updateCardWidth)
  }, [getCardWidth])

  const checkScrollability = useCallback(() => {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
  }, [])

  useEffect(() => {
    checkScrollability()
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
      return () => container.removeEventListener("scroll", checkScrollability)
    }
  }, [checkScrollability])

  useEffect(() => {
    if (!containerRef.current || properties.length === 0) return
    const containerWidth = containerRef.current.clientWidth
    const visibleCards = Math.floor(containerWidth / (cardWidth - 16)) || 1
    const currentPage = Math.floor(
      (containerRef.current?.scrollLeft || 0) / (cardWidth - 16)
    )
    const totalPages = Math.ceil(properties.length - visibleCards + 1)

    const newAnnouncement = `Showing ${properties.length} properties, currently on page ${
      currentPage + 1
    } of ${totalPages}`
    setAnnouncement(newAnnouncement)
  }, [properties.length, cardWidth])

  const handleWheel = (e: React.WheelEvent) => {
    if (prefersReducedMotion) return
    // Direct scroll - no velocity tracking needed
    if (e.deltaY !== 0 && containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setScrollStart(containerRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    const diff = startX - e.touches[0].clientX
    containerRef.current.scrollLeft = scrollStart + diff
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return

    const diff = startX - e.changedTouches[0].clientX
    setIsDragging(false)

    // Simple momentum scroll
    if (Math.abs(diff) > 5 && containerRef.current) {
      containerRef.current.scrollBy({
        left: diff * 0.3,
        behavior: "auto",
      })
    }

    if (Math.abs(diff) > 50 && !canScrollRight && !canScrollLeft && onRefresh) {
      setIsRefreshing(true)
      const result = onRefresh()
      if (result && typeof result.then === "function") {
        result.finally(() => setIsRefreshing(false))
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const scrollTo = (direction: "left" | "right") => {
    if (!containerRef.current) return

    const scrollAmount = direction === "left" ? -cardWidth + 16 : cardWidth - 16

    if (prefersReducedMotion) {
      containerRef.current.scrollLeft += scrollAmount
    } else {
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const getTotalDots = () => {
    if (!containerRef.current) return 1
    const containerWidth = containerRef.current.clientWidth
    return Math.max(
      1,
      Math.ceil(
        properties.length - Math.floor(containerWidth / (cardWidth - 16)) + 1
      )
    )
  }

  const getCurrentDotIndex = () => {
    if (!containerRef.current) return 0
    const containerWidth = containerRef.current.clientWidth
    const visibleCards = Math.floor(containerWidth / (cardWidth - 16)) || 1
    return Math.max(
      0,
      Math.min(
        Math.floor(containerRef.current.scrollLeft / (cardWidth - 16)),
        properties.length - visibleCards
      )
    )
  }

  const totalDots = getTotalDots()
  const currentDot = getCurrentDotIndex()

  useEffect(() => {
    setActiveDot(currentDot)
  }, [currentDot])

  const handleDotClick = (index: number) => {
    if (!containerRef.current) return

    if (prefersReducedMotion) {
      containerRef.current.scrollLeft = index * (cardWidth - 16)
    } else {
      containerRef.current.scrollTo({
        left: index * (cardWidth - 16),
        behavior: "smooth",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      scrollTo("left")
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      scrollTo("right")
    }
  }

  if (loading) {
    return (
      <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
        {title && (
          <h2
            id={`carousel-title-${title}`}
            className="mb-4 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        )}
        <SkeletonCarousel count={skeletonCount} />
      </section>
    )
  }

  if (error) {
    return (
      <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
        {title && (
          <h2
            id={`carousel-title-${title}`}
            className="mb-4 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        )}
        <ErrorState error={error} onRetry={onRetry} />
      </section>
    )
  }

  if (properties.length === 0) {
    return (
      <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
        {title && (
          <h2
            id={`carousel-title-${title}`}
            className="mb-4 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        )}
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </section>
    )
  }

  if (properties.length === 1) {
    return (
      <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
        {title && (
          <h2
            id={`carousel-title-${title}`}
            className="mb-4 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        )}
        <div className="flex justify-center">
          <PropertyCard property={properties[0]} priority={true} index={0} />
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
      <AnimatePresence mode="wait">
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {title && (
        <h2
          id={`carousel-title-${title}`}
          className="mb-4 text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
      )}

      <div className="group relative">
        <motion.button
          onClick={() => scrollTo("left")}
          disabled={!canScrollLeft}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed",
            canScrollLeft ? "opacity-0 group-hover:opacity-100" : "opacity-0"
          )}
          style={{
            transform: "translateY(-50%) translateX(-50%)",
            left: "0.5rem",
          }}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-900" />
        </motion.button>

        <motion.button
          onClick={() => scrollTo("right")}
          disabled={!canScrollRight}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed",
            canScrollRight ? "opacity-0 group-hover:opacity-100" : "opacity-0"
          )}
          style={{
            transform: "translateY(-50%) translateX(50%)",
            right: "0.5rem",
          }}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-900" />
        </motion.button>

        <div
          ref={(node) => {
            containerRef.current = node
            containerIntersectionRef(node)
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Property carousel"
          className="focus:outline-none scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 scrollbar-w-[6px] flex gap-4 overflow-x-auto scroll-snap-x-mandatory pb-4 scrollbar-hide"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: isDragging ? "auto" : prefersReducedMotion
              ? "auto"
              : "smooth",
          }}
        >
          {properties.slice(0, 20).map((property, index) => (
            <motion.div
              key={property.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={
                hasIntersected && !prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : undefined
              }
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : Math.min(index * 0.1, 0.5),
              }}
              className="flex-shrink-0 scroll-snap-align-start"
            >
              <PropertyCard
                property={property}
                priority={index < 3}
                index={index}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {totalDots > 1 && (
        <nav aria-label="Carousel navigation" className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalDots }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === activeDot
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeDot ? "true" : undefined}
            />
          ))}
        </nav>
      )}

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </section>
  )
}

PropertyCarousel.Skeleton = SkeletonCarousel
PropertyCarousel.Empty = EmptyState
PropertyCarousel.Error = ErrorState

export type { PropertyCarouselProps }
export { PropertyCarousel as default }