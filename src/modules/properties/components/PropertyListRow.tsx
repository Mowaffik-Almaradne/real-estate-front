"use client"

import { useTranslations } from "next-intl"
import { Bath, Bed, MapPin, Square } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { VerifiedBadge } from "src/modules/auth"
import { FavoriteButton } from "src/modules/properties/components/FavoriteButton"
import { statusLabel, statusTone } from "@/lib/format"
import { resolvePropertyImage } from "@/lib/property-images"
import { useRouter } from "@/i18n/navigation"

export interface PropertyListItem {
  id: number
  name: string
  formatted_price: string
  property_type: string
  type_of_contract: string
  status: string
  rooms: number
  bathrooms: number
  area: string
  main_image: string | null
  main_image_thumb?: string | null
  city?: { name: string } | null
  country?: { name: string } | null
  publisher: {
    id: number
    name: string
    is_verified?: boolean
    publisher_type?: "individual" | "office" | null
  }
  is_favorited?: boolean
  favorites_count?: number
}

interface PropertyListRowProps {
  property: PropertyListItem
  onOpen?: (id: number) => void
}

export function PropertyListRow({ property, onOpen }: PropertyListRowProps) {
  const router = useRouter()
  const t = useTranslations("property.card")
  const tStatus = useTranslations("status")
  const open = () => onOpen?.(property.id) ?? router.push(`/properties/${property.id}`)
  const imageSrc = resolvePropertyImage(property, { forceFallback: true })

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          open()
        }
      }}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center"
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={property.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-1 top-1">
          <FavoriteButton
            propertyId={property.id}
            initial={Boolean(property.is_favorited)}
            initialCount={property.favorites_count}
          />
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{property.name}</h3>
          <span className="whitespace-nowrap font-bold text-primary">
            {property.formatted_price}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge variant="secondary" className="capitalize">
            {property.property_type}
          </Badge>
          <Badge variant="outline">
            {property.type_of_contract === "rent" ? t("forRent") : t("forSale")}
          </Badge>
          <Badge variant={statusTone(property.status) === "muted" ? "secondary" : "default"}>
            {statusLabel(property.status, tStatus)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {property.city?.name}, {property.country?.name}
          </span>
          <span className="flex items-center gap-1">
            <Bed className="size-3" />
            {property.rooms} {property.rooms === 1 ? t("bed_one") : t("bed_other")}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3" />
            {property.bathrooms} {property.bathrooms === 1 ? t("bath_one") : t("bath_other")}
          </span>
          <span className="flex items-center gap-1">
            <Square className="size-3" />
            {property.area} {t("areaUnit")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{property.publisher.name}</span>
          <VerifiedBadge
            verified={property.publisher.is_verified}
            label={property.publisher.publisher_type === "office" ? t("officeBadge") : t("verifiedBadge")}
            variant="outline"
          />
        </div>
      </div>
    </div>
  )
}
