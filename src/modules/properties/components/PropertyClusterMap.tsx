"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { Building2, MapPin } from "lucide-react"

import { PropertyDrawer } from "src/modules/map/PropertyDrawer"
import {
  BOUNDS_DEBOUNCE_MS,
  CLUSTER_RADIUS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAX_CLUSTER_ZOOM,
  type MapBounds,
} from "src/modules/map/types"
import { useClusteredMarkers } from "src/modules/map/useClusteredMarkers"
import { boundsCenter, toMarkers } from "src/modules/map/mapUtils"
import { cn } from "lib/utils"
import type { PropertyDto } from "@/types/dto"

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

function InitialBounds({
  bounds,
  center,
  zoom,
}: {
  bounds: MapBounds | null
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(
        [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        ],
        { animate: false }
      )
    } else if (zoom) {
      map.setView(center, zoom, { animate: false })
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export interface PropertyClusterMapProps {
  properties: PropertyDto[]
  className?: string
  initialBounds?: MapBounds | null
  initialZoom?: number
  initialCenter?: [number, number]
  onBoundsChange?: (bounds: MapBounds, zoom: number) => void
  onMarkerClick?: (property: PropertyDto) => void
}

export function PropertyClusterMap({
  properties,
  className,
  initialBounds = null,
  initialZoom = DEFAULT_MAP_ZOOM,
  initialCenter = DEFAULT_MAP_CENTER,
  onBoundsChange,
  onMarkerClick,
}: PropertyClusterMapProps) {
  const t = useTranslations("map")
  const locale = useLocale()
  const points = useMemo(() => toMarkers(properties), [properties])
  const [bounds, setBounds] = useState<MapBounds | null>(initialBounds)
  const [zoom, setZoom] = useState<number>(initialZoom)
  const [selected, setSelected] = useState<PropertyDto | null>(null)
  const debounceRef = useRef<number | null>(null)
  const mapRef = useRef<L.Map | null>(null)

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

  const handleClusterClick = useCallback(
    (clusterId: number, lat: number, lng: number) => {
      const nextZoom = getExpansionZoom(clusterId)
      const map = mapRef.current
      if (map && nextZoom !== null && nextZoom <= MAX_CLUSTER_ZOOM) {
        map.setView([lat, lng], nextZoom)
      }
    },
    [getExpansionZoom]
  )

  const handleSelectProperty = useCallback(
    (property: PropertyDto) => {
      setSelected(property)
      onMarkerClick?.(property)
    },
    [onMarkerClick]
  )

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

  const center = initialBounds ? boundsCenter(initialBounds) : initialCenter
  const initialZoomValue = initialBounds ? undefined : initialZoom

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
        zoom={initialZoomValue}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e5e7eb" }}
        ref={(instance) => {
          mapRef.current = instance
        }}
        whenReady={() => {
          if (initialBounds && mapRef.current) {
            mapRef.current.fitBounds(
              [
                [initialBounds.south, initialBounds.west],
                [initialBounds.north, initialBounds.east],
              ],
              { animate: false }
            )
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsTracker onChange={handleBoundsChange} />
        {initialBounds ? (
          <InitialBounds
            bounds={initialBounds}
            center={center}
            zoom={initialZoom}
          />
        ) : null}

        {clusters.map((cluster) => {
          if (cluster.isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                position={[cluster.lat, cluster.lng]}
                icon={buildClusterIcon(cluster.count)}
                eventHandlers={{
                  click: () => handleClusterClick(cluster.id, cluster.lat, cluster.lng),
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
                click: () => handleSelectProperty(property),
              }}
            />
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
          background: linear-gradient(180deg, hsl(var(--primary)) 0 24px, hsl(var(--primary)) 24px 26px, transparent 26px);
          clip-path: polygon(50% 100%, 0 50%, 0 0, 100% 0, 100% 50%);
        }
      `}</style>

      {selected && (
        <PropertyDrawer
          property={selected}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}

      {points.length > 0 && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-background/85 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
          {t("showing", { count: clusters.reduce((acc, c) => acc + (c.isCluster ? c.count : 1), 0) })}
        </div>
      )}
      <span className="sr-only" aria-live="polite">{t("legend", { radius: CLUSTER_RADIUS })}</span>
      <span className="sr-only">{locale === "ar" ? "خريطة العقارات" : "Properties map"}</span>
    </div>
  )
}

export { Building2 }