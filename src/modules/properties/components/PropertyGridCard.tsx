"use client"

import { useRouter } from "next/navigation"
import { Bath, Bed, Building, MapPin, Square } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { VerifiedBadge } from "src/modules/auth"
import { FavoriteButton } from "src/modules/properties/components/FavoriteButton"
import { formatNumber, statusLabel, statusTone } from "@/lib/format"
import type { PropertyDto } from "@/types/dto"

interface PropertyGridCardProps {
  property: PropertyDto
}

export function PropertyGridCard({ property }: PropertyGridCardProps) {
  const router = useRouter()
  const open = () => router.push(`/properties/${property.id}`)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          open()
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border-border/50 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.main_image || property.main_image_thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.main_image_thumb || property.main_image!}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Building className="size-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge variant="secondary" className="capitalize">
            {property.property_type}
          </Badge>
          <Badge variant="outline" className="bg-white/80 text-foreground">
            {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
        <div className="absolute right-2 top-2">
          <FavoriteButton
            propertyId={property.id}
            initial={Boolean(property.is_favorited)}
            initialCount={property.favorites_count}
          />
        </div>
        <div className="absolute right-2 bottom-2">
          <Badge variant={statusTone(property.status) === "muted" ? "secondary" : "default"}>
            {statusLabel(property.status)}
          </Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{property.name}</h3>
          <span className="whitespace-nowrap font-bold text-primary">
            {property.formatted_price}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="truncate">
            {property.city.name}, {property.country.name}
          </span>
        </div>
        <div className="flex flex-1 items-end justify-between gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <Bed className="size-3" />
              {property.rooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-3" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Square className="size-3" />
              {formatNumber(property.area, "en-US", { maximumFractionDigits: 0 })} m²
            </span>
          </div>
          <VerifiedBadge
            verified={property.publisher.is_verified}
            label={property.publisher.publisher_type === "office" ? "Office" : "Verified"}
            variant="outline"
            showIcon={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}
