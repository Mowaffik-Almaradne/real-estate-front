"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Home, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { PropertyCard, Skeleton as PropertyCardSkeleton } from "./PropertyCard"
import { Button } from "components/ui/button"
import { useIntersectionObserver, useReducedMotion } from "@/hooks"
import { cn } from "lib/utils"
import type { PropertyDto } from "@/types/dto"
import {
  useCarouselScroll,
  useCarouselDrag,
  CarouselNavigation,
  CarouselDots,
} from "./carousel"

type Property = PropertyDto & { is_new?: boolean; is_reduced?: boolean }

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

function CarouselTitle({ title }: { title?: string }) {
  if (!title) return null
  return (
    <h2
      id={`carousel-title-${title}`}
      className="mb-4 text-lg font-semibold text-foreground"
    >
      {title}
    </h2>
  )
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  const t = useTranslations("property.carousel")
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Home className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title ?? t("emptyTitle")}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description ?? t("emptyDescription")}
      </p>
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
  const t = useTranslations("property.carousel")
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
        {t("errorTitle")}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {error?.message || t("errorDescription")}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" aria-label={t("retryAria")}>
          <RefreshCw className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
          {t("retry")}
        </Button>
      )}
    </div>
  )
}

function SkeletonCarousel({ count = 4 }: { count?: number }) {
  const t = useTranslations("property.carousel")
  const skeletons = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  )
  return (
    <div
      className="flex gap-4 overflow-hidden"
      role="status"
      aria-label={t("loadingAria")}
    >
      {skeletons.map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

function RefreshIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
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
  )
}

function CarouselSection({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={title ? `carousel-title-${title}` : undefined}>
      <CarouselTitle title={title} />
      {children}
    </section>
  )
}

const SCROLLBAR_STYLES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer { animation: shimmer 1.5s infinite; }
  .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); border-radius: 9999px; }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.5); }
`

export function PropertyCarousel({
  properties,
  title,
  loading = false,
  skeletonCount = 4,
  onRefresh: _onRefresh,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  error,
  onRetry,
}: PropertyCarouselProps) {
  const t = useTranslations("property.carousel")
  const prefersReducedMotion = useReducedMotion()
  const [announcement, setAnnouncement] = useState("")

  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    cardWidth,
    activeDot,
    totalDots,
    scrollBy,
    scrollToDot,
  } = useCarouselScroll({ itemCount: properties.length })

  const { onTouchStart, onTouchMove, onTouchEnd, isDragging } = useCarouselDrag()

  const { ref: containerIntersectionRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "200px",
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container || properties.length === 0) return
    const visibleCards =
      Math.floor(container.clientWidth / (cardWidth - 16)) || 1
    const currentPage = Math.floor(container.scrollLeft / (cardWidth - 16))
    const totalPages = Math.ceil(properties.length - visibleCards + 1)
    setAnnouncement(
      t("announcement", {
        count: properties.length,
        current: currentPage + 1,
        total: totalPages,
      })
    )
  }, [properties.length, cardWidth, t, containerRef, activeDot])

  const handleWheel = (e: React.WheelEvent) => {
    if (prefersReducedMotion) return
    if (e.deltaY !== 0 && containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      scrollBy("left")
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      scrollBy("right")
    }
  }

  if (loading) {
    return (
      <CarouselSection title={title}>
        <SkeletonCarousel count={skeletonCount} />
      </CarouselSection>
    )
  }

  if (error) {
    return (
      <CarouselSection title={title}>
        <ErrorState error={error} onRetry={onRetry} />
      </CarouselSection>
    )
  }

  if (properties.length === 0) {
    return (
      <CarouselSection title={title}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </CarouselSection>
    )
  }

  if (properties.length === 1) {
    return (
      <CarouselSection title={title}>
        <div className="flex justify-center">
          <PropertyCard property={properties[0]} priority={true} index={0} />
        </div>
      </CarouselSection>
    )
  }

return (
    <CarouselSection title={title}>
      <RefreshIndicator visible={false} />

      <div className="group relative">
        <CarouselNavigation
          onPrev={() => scrollBy("left")}
          onNext={() => scrollBy("right")}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeftLabel={t("scrollLeft")}
          scrollRightLabel={t("scrollRight")}
        />

        <div
          ref={(node) => {
            containerRef.current = node
            containerIntersectionRef(node)
          }}
          onWheel={handleWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label={t("carouselAria")}
          className={cn(
            "focus:outline-none scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/30 scrollbar-w-[6px] flex gap-4 overflow-x-auto scroll-snap-x-mandatory pb-4 scrollbar-hide"
          )}
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior:
              isDragging || prefersReducedMotion ? "auto" : "smooth",
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

      <CarouselDots
        total={totalDots}
        active={activeDot}
        onDotClick={scrollToDot}
        ariaLabel={t("navAria")}
        goToSlideLabel={(index: number) => t("goToSlide", { index })}
      />

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <style jsx global>{SCROLLBAR_STYLES}</style>
    </CarouselSection>
  )
}

PropertyCarousel.Skeleton = SkeletonCarousel
PropertyCarousel.Empty = EmptyState
PropertyCarousel.Error = ErrorState

export type { PropertyCarouselProps }
export { PropertyCarousel as default }