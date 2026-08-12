"use client"

import { motion } from "framer-motion"

import { cn } from "lib/utils"

interface CarouselDotsProps {
  total: number
  active: number
  onDotClick: (index: number) => void
  ariaLabel: string
  goToSlideLabel: (index: number) => string
}

export function CarouselDots({
  total,
  active,
  onDotClick,
  ariaLabel,
  goToSlideLabel,
}: CarouselDotsProps) {
  if (total <= 1) return null
  return (
    <nav aria-label={ariaLabel} className="mt-4 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onDotClick(index)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === active
              ? "w-8 bg-primary"
              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
          aria-label={goToSlideLabel(index + 1)}
          aria-current={index === active ? "true" : undefined}
        />
      ))}
    </nav>
  )
}