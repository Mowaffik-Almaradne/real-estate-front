"use client"

import { memo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { useIntersectionObserver, useReducedMotion } from "@/hooks"

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

interface PropertyCardProps {
  property: Property
  priority?: boolean
  index?: number
  "aria-label"?: string
}

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 w-full max-w-sm"
      role="region"
      aria-label="Loading property"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-48 rounded bg-muted animate-pulse" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

export const PropertyCard = memo(function PropertyCard({
  property,
  priority = false,
  index = 0,
  "aria-label": ariaLabel,
}: PropertyCardProps) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const { ref: cardRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  })

  const prefersReducedMotion = useReducedMotion()

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsFavorite((prev) => !prev)
    },
    []
  )

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      router.push(`/properties/${property.id}`)
    },
    [router, property.id]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        router.push(`/properties/${property.id}`)
      }
    },
    [router, property.id]
  )

  const statusLabel =
    property.status === "approved"
      ? property.type_of_contract === "rent"
        ? "For Rent"
        : "For Sale"
      : property.status === "pending"
        ? "Pending"
        : "Sold"

  const cardVariants: Variants = prefersReducedMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          },
        },
      }

  const shouldAnimate = hasIntersected || priority

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      animate={shouldAnimate ? "visible" : undefined}
      className="group relative flex-shrink-0 w-full max-w-sm cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/properties/${property.id}`)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={
        ariaLabel ||
        `${property.name}, ${property.formatted_price}, ${property.city?.name}, ${property.rooms} bedrooms, ${property.bathrooms} bathrooms`
      }
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {!isLoaded && !thumbLoaded && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer"
            aria-hidden="true"
          />
        )}

        {property.main_image_thumb && (
          <img
            src={property.main_image_thumb}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              showFullImage ? "opacity-0" : "opacity-100"
            } ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => {
              setThumbLoaded(true)
              setIsLoaded(true)
              if (property.main_image) {
                const fullImg = new window.Image()
                fullImg.src = property.main_image
                fullImg.onload = () => setShowFullImage(true)
              }
            }}
          />
        )}

        {property.main_image && !property.main_image_thumb && (
          <img
            src={property.main_image}
            alt=""
            className={`h-full w-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-105" : "scale-100"
            } ${isLoaded ? "opacity-100" : "opacity-0"}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
          />
        )}

        {!property.main_image_thumb && !property.main_image && (
          <div
            className="flex h-full w-full items-center justify-center bg-muted"
            aria-hidden="true"
          >
            <div className="h-12 w-12 rounded-full bg-muted-foreground/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-white/20 text-white">
            {statusLabel}
          </span>
          {property.is_new && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
              className="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-green-500/80 text-white"
            >
              New
            </motion.span>
          )}
          {property.is_reduced && (
            <motion.span
              animate={
                prefersReducedMotion
                  ? {}
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ repeat: Infinity, duration: 2 }}
              className="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md bg-red-500/80 text-white"
            >
              Reduced
            </motion.span>
          )}
        </div>

        <motion.button
          onClick={handleFavorite}
          whileTap={{ scale: 0.85 }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isFavorite
              ? "bg-red-500/80 text-white"
              : "bg-white/20 text-white hover:bg-white/40"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : isFavorite
                  ? { scale: [1, 1.3, 0.9, 1.1, 1] }
                  : {}
            }
            transition={{ duration: 0.4 }}
          >
            <Heart
              className={`h-4 w-4 transition-transform duration-300 ${
                isFavorite ? "fill-current" : ""
              }`}
            />
          </motion.div>
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={
            isHovered
              ? { y: 0, opacity: 1 }
              : { y: 20, opacity: 0 }
          }
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-3 left-3 right-3"
        >
          <motion.button
            onClick={handleQuickView}
            whileTap={{ scale: 0.95 }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-white"
            aria-label={`View ${property.name} details`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Quick View
          </motion.button>
        </motion.div>
      </div>

      <div className="mt-3 space-y-2">
        {property.is_new || property.is_reduced ? (
          <motion.p
            animate={
              prefersReducedMotion
                ? {}
                : {
                    color: property.is_reduced
                      ? ["#ef4444", "#dc2626", "#ef4444"]
                      : ["#22c55e", "#16a34a", "#22c55e"],
                  }
            }
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xl font-semibold text-foreground"
          >
            {property.formatted_price}
          </motion.p>
        ) : (
          <p className="text-xl font-semibold text-foreground">
            {property.formatted_price}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-medium text-foreground leading-tight">
          {property.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">
            {property.city?.name}, {property.country?.name}
          </span>
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3" aria-hidden="true" />
            <span>
              {property.rooms}{" "}
              {property.rooms === 1 ? "Bed" : "Beds"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3" aria-hidden="true" />
            <span>
              {property.bathrooms}{" "}
              {property.bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-3 w-3" aria-hidden="true" />
            <span>
              {property.area} m&sup2;
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
})

PropertyCard.displayName = "PropertyCard"

const PropertyCardSkeleton = SkeletonCard

export { PropertyCard as default, PropertyCardSkeleton as Skeleton }
export type { PropertyCardProps }