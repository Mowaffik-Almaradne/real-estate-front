"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bath, BedDouble, Building2, ChevronRight, MapPin, Maximize2, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { buttonVariants } from "components/ui/button"
import { Card } from "components/ui/card"
import { cn } from "lib/utils"
import type { PropertyDto } from "@/types/dto"

import {
  BOUNDS_DEBOUNCE_MS,
  type MapBounds,
} from "src/modules/map/types"
import { useClusteredMarkers } from "src/modules/map/useClusteredMarkers"
import { toMarkers } from "src/modules/map/mapUtils"

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function buildClusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 36 : count < 100 ? 44 : 52
  return L.divIcon({
    html: `<div class="map-cluster-pin" style="width:${size}px;height:${size}px"><span>${count}</span></div>`,
    className: "",
    iconSize: [size, size],
  })
}

function buildSelectedIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div class="map-pin-selected" aria-hidden="true"></div>`,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  })
}

interface BoundsTrackerProps {
  onChange: (bounds: MapBounds, zoom: number) => void
}

function BoundsTracker({ onChange }: BoundsTrackerProps) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      onChange(
        {
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        },
        map.getZoom()
      )
    },
    zoomend: () => {
      const b = map.getBounds()
      onChange(
        {
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        },
        map.getZoom()
      )
    },
  })
  return null
}

function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13)
      return
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])
  return null
}

export interface PropertyMapViewProps {
  properties: PropertyDto[]
  className?: string
  onBoundsChange?: (bounds: MapBounds, zoom: number) => void
}

export function PropertyMapView({
  properties,
  className,
  onBoundsChange,
}: PropertyMapViewProps) {
  const t = useTranslations("property.map")
  const tMap = useTranslations("map")
  const locale = useLocale()
  const points = useMemo(() => toMarkers(properties), [properties])
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const [zoom, setZoom] = useState(13)
  const [selected, setSelected] = useState<PropertyDto | null>(null)
  const debounceRef = useRef<number | null>(null)

  const handleBoundsChange = useCallback(
    (next: MapBounds, nextZoom: number) => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
      debounceRef.current = window.setTimeout(() => {
        setBounds(next)
        setZoom(nextZoom)
        onBoundsChange?.(next, nextZoom)
      }, BOUNDS_DEBOUNCE_MS)
    },
    [onBoundsChange]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const { clusters, getExpansionZoom } = useClusteredMarkers({
    markers: points,
    bounds,
    zoom,
  })

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[60vh] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground",
          className
        )}
        dir="ltr"
      >
        <MapPin className="size-6" aria-hidden="true" />
        <p className="font-medium">{t("noCoordinates")}</p>
      </div>
    )
  }

  const center: [number, number] = [points[0].lat, points[0].lng]

  return (
    <div
      className={cn(
        "relative h-[60vh] w-full overflow-hidden rounded-lg border",
        className
      )}
      dir="ltr"
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e5e7eb" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <BoundsTracker onChange={handleBoundsChange} />

        {clusters.map((cluster) => {
          if (cluster.isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                position={[cluster.lat, cluster.lng]}
                icon={buildClusterIcon(cluster.count)}
                eventHandlers={{
                  click: () => {
                    const next = getExpansionZoom(cluster.id)
                    if (next !== null) {
                      setZoom(next)
                    }
                  },
                }}
              />
            )
          }
          const property = cluster.markers[0]?.property
          if (!property) return null
          const isSelected = selected?.id === property.id
          return (
            <Marker
              key={`marker-${property.id}`}
              position={[cluster.lat, cluster.lng]}
              icon={isSelected ? buildSelectedIcon() : defaultIcon}
              eventHandlers={{
                click: () => setSelected(property),
              }}
            >
              {!isSelected && (
                <Popup>
                  <PropertyMapCard property={property} locale={locale} />
                </Popup>
              )}
            </Marker>
          )
        })}
      </MapContainer>

      <style jsx global>{`
        .map-cluster-pin {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
          border: 3px solid #fff;
        }
        .map-pin-selected {
          width: 32px;
          height: 40px;
          background: hsl(var(--primary));
          clip-path: polygon(50% 100%, 0 50%, 0 0, 100% 0, 100% 50%);
        }
      `}</style>

      {selected && (
        <div
          role="dialog"
          aria-label={tMap("drawer.title")}
          aria-modal="false"
          className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
        >
          <Card className="mx-auto flex max-w-3xl flex-row gap-3 p-3 shadow-2xl border-primary/30 backdrop-blur">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-48">
              {selected.main_image_thumb || selected.main_image ? (
                <Image
                  src={selected.main_image_thumb ?? selected.main_image ?? ""}
                  alt={selected.name}
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
                    {tMap("drawer.selected")}
                  </p>
                  <h3 className="truncate font-semibold">{selected.name}</h3>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" aria-hidden="true" />
                    {selected.city?.name}
                    {selected.country?.name ? `, ${selected.country.name}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={tMap("drawer.close")}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <p className="text-base font-bold text-primary">
                {selected.formatted_price}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="size-3" aria-hidden="true" /> {selected.rooms}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bath className="size-3" aria-hidden="true" /> {selected.bathrooms}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="size-3" aria-hidden="true" /> {String(selected.area)} m²
                </span>
              </div>

              <div className="mt-auto flex items-center justify-end gap-2">
                <Link
                  href={`/${locale}/properties/${selected.id}`}
                  className={buttonVariants({ size: "sm", className: "gap-1.5" })}
                >
                  {tMap("drawer.open")}
                  <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-background/85 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
        {tMap("showing", {
          count: clusters.reduce((acc, c) => acc + (c.isCluster ? c.count : 1), 0),
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {tMap("legend", { radius: 60 })}
      </span>
    </div>
  )
}

function PropertyMapCard({
  property,
  locale,
}: {
  property: PropertyDto
  locale: string
}) {
  return (
    <div className="w-56 space-y-2 font-sans" dir={locale === "ar" ? "rtl" : "ltr"}>
      {property.main_image ? (
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          <Image
            src={property.main_image_thumb ?? property.main_image}
            alt={property.name}
            fill
            sizes="224px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-muted-foreground">
          <MapPin className="size-5" aria-hidden="true" />
        </div>
      )}
      <Link
        href={`/${locale}/properties/${property.id}`}
        className="block text-sm font-semibold leading-tight hover:underline"
      >
        {property.name}
      </Link>
      <p className="text-xs text-muted-foreground">
        {property.city.name}
        {property.country?.name ? `, ${property.country.name}` : ""}
      </p>
      <p className="text-sm font-bold text-primary">{property.formatted_price}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
    </div>
  )
}