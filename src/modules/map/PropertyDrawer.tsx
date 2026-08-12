"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Bath, BedDouble, Building2, ChevronRight, MapPin, Maximize2, X } from "lucide-react"

import { buttonVariants } from "components/ui/button"
import { Card } from "components/ui/card"
import { cn } from "lib/utils"
import type { PropertyDto } from "@/types/dto"

interface PropertyDrawerProps {
  property: PropertyDto | null
  open: boolean
  onClose: () => void
}

export function PropertyDrawer({ property, open, onClose }: PropertyDrawerProps) {
  const t = useTranslations("map.drawer")
  const locale = useLocale()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!property) return null

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      aria-modal="false"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 px-4 pb-4 transition-transform duration-300",
        open ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Card className="mx-auto flex max-w-3xl flex-row gap-3 p-3 shadow-2xl border-primary/30 backdrop-blur">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-48">
          {property.main_image_thumb || property.main_image ? (
            <Image
              src={property.main_image_thumb ?? property.main_image ?? ""}
              alt={property.name}
              fill
              sizes="(max-width: 640px) 128px, 192px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Building2 className="size-6" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("selected")}
              </p>
              <h3 className="truncate font-semibold">{property.name}</h3>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                {property.city?.name}
                {property.country?.name ? `, ${property.country.name}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-base font-bold text-primary">
            {property.formatted_price}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="size-3" aria-hidden="true" /> {property.rooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="size-3" aria-hidden="true" /> {property.bathrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="size-3" aria-hidden="true" /> {String(property.area)} m²
            </span>
          </div>

          <div className="mt-auto flex items-center justify-end gap-2">
            <Link
              href={`/${locale}/properties/${property.id}`}
              className={buttonVariants({ size: "sm", className: "gap-1.5" })}
            >
              {t("open")}
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}