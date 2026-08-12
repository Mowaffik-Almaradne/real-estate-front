"use client"

import { SearchX } from "lucide-react"
import { useTranslations } from "next-intl"

import { PropertyGridCard } from "src/modules/properties/components/PropertyGridCard"
import type { PropertyDto } from "@/types/dto"
import { cn } from "@/lib/utils"

export interface PublisherPropertiesGridProps {
  properties: PropertyDto[]
  isLoading?: boolean
  className?: string
}

export function PublisherPropertiesGrid({
  properties,
  isLoading = false,
  className,
}: PublisherPropertiesGridProps) {
  const t = useTranslations("publisher")

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
        <SearchX className="size-7" aria-hidden />
        <p className="font-medium">{t("noProperties")}</p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {properties.map((property) => (
        <PropertyGridCard key={property.id} property={property} />
      ))}
    </div>
  )
}