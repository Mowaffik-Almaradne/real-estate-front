"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "lib/utils"
import { useReducedMotion } from "@/hooks"

interface CarouselNavigationProps {
  onPrev: () => void
  onNext: () => void
  canScrollLeft: boolean
  canScrollRight: boolean
  scrollLeftLabel: string
  scrollRightLabel: string
}

export function CarouselNavigation({
  onPrev,
  onNext,
  canScrollLeft,
  canScrollRight,
  scrollLeftLabel,
  scrollRightLabel,
}: CarouselNavigationProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
      <motion.button
        onClick={onPrev}
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
        aria-label={scrollLeftLabel}
      >
        <ChevronLeft className="h-5 w-5 text-gray-900" />
      </motion.button>

      <motion.button
        onClick={onNext}
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
        aria-label={scrollRightLabel}
      >
        <ChevronRight className="h-5 w-5 text-gray-900" />
      </motion.button>
    </>
  )
}