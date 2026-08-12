"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Building2, X } from "lucide-react"

import { Button } from "components/ui/button"
import { Card } from "components/ui/card"
import { useCompare } from "src/modules/compare"
import type { PropertyDto } from "@/types/dto"

interface ComparisonHeaderProps {
  properties: PropertyDto[]
  locale: string
  loading: boolean
}

export function ComparisonHeader({
  properties,
  locale,
  loading,
}: ComparisonHeaderProps) {
  const t = useTranslations("compare")
  const router = useRouter()
  const { remove } = useCompare()

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${properties.length || 1}, minmax(0, 1fr))` }}>
      <div className="hidden md:block" aria-hidden="true" />
      {properties.map((property) => (
        <Card key={property.id} className="relative overflow-hidden">
          <button
            onClick={() => remove(property.id)}
            aria-label={t("removeFromCompare")}
            className="absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => router.push(`/${locale}/properties/${property.id}`)}
            className="block w-full text-left"
          >
            <div className="relative h-32 w-full bg-muted">
              {property.main_image_thumb || property.main_image ? (
                <Image
                  src={property.main_image_thumb || property.main_image || ""}
                  alt={property.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Building2 className="size-8" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">
                {property.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {property.city?.name}
                {property.country?.name ? `, ${property.country.name}` : ""}
              </p>
            </div>
          </button>
        </Card>
      ))}
      {loading && properties.length === 0 && (
        <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">
          {t("loading")}
        </Card>
      )}
      {!loading && properties.length === 0 && (
        <Card className="col-span-full p-6 text-center text-sm text-muted-foreground">
          {t("emptyHeader")}
        </Card>
      )}
    </div>
  )
}

export function ComparisonHeaderActions({
  onClear,
}: {
  onClear: () => void
}) {
  const t = useTranslations("compare")
  return (
    <div className="flex items-center justify-end">
      <Button variant="ghost" size="sm" onClick={onClear}>
        {t("clearAll")}
      </Button>
    </div>
  )
}