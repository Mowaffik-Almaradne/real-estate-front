"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Bath, Bed, Building, MapPin, Pencil, Square, Trash2, Eye } from "lucide-react"

import { Button } from "components/ui/button"
import { StatusSelect } from "src/modules/properties/components/StatusSelect"

export interface DashboardProperty {
  id: number
  name: string
  type_of_contract: string
  area: string
  rooms: number
  bathrooms: number
  formatted_price: string
  status: string
  main_image: string
  main_image_thumb: string
  city: { name: string }
  country: { name: string }
  publisher: { name: string; email: string }
}

interface PropertyDashboardCardProps {
  property: DashboardProperty
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: string) => Promise<void>
}

export function PropertyDashboardCard({
  property,
  onDelete,
  onStatusChange,
}: PropertyDashboardCardProps) {
  const router = useRouter()

  return (
    <div className="group bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
      <div
        className="relative h-48 bg-muted cursor-pointer"
        onClick={() => router.push(`/dashboard/properties/${property.id}`)}
      >
        {property.main_image_thumb || property.main_image ? (
          <Image
            src={property.main_image_thumb || property.main_image}
            alt={property.name}
            width={400}
            height={300}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Building className="size-12" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusSelect
            status={property.status}
            onStatusChange={(newStatus) => onStatusChange(property.id, newStatus)}
          />
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg truncate">{property.name}</h3>
          <span className="font-bold text-foreground">{property.formatted_price}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="size-4" />
          <span className="truncate">
            {property.city?.name}, {property.country?.name}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Square className="size-4" />
            <span>{property.area} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="size-4" />
            <span>{property.rooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="size-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{property.publisher?.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/dashboard/properties/${property.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}