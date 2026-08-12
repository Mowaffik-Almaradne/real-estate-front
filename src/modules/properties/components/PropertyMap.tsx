"use client"

import { useMemo } from "react"
import { ExternalLink, MapPin } from "lucide-react"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

const pinIcon = L.divIcon({
  className: "property-map-pin",
  html: `<div style="position:relative;width:32px;height:40px"><div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div><div style="position:absolute;left:50%;top:18px;transform:translateX(-50%);width:2px;height:18px;background:#ef4444"></div></div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
})

function FocusOn({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useMemo(() => {
    map.setView([lat, lng], 15)
  }, [map, lat, lng])
  return null
}

export interface PropertyMapProps {
  latitude: number
  longitude: number
  label?: string
  className?: string
  height?: number
}

export function PropertyMap({
  latitude,
  longitude,
  label,
  className,
  height = 280,
}: PropertyMapProps) {
  const locale = useLocale()
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ height }}
        dir="ltr"
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ background: "#e5e7eb" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FocusOn lat={latitude} lng={longitude} />
          <Marker position={[latitude, longitude]} icon={pinIcon} />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" />
          {label ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
          aria-label={locale === "ar" ? "فتح في خرائط جوجل" : "Open in Google Maps"}
        >
          <ExternalLink className="size-3.5" />
          {locale === "ar" ? "فتح في الخريطة" : "Open in Maps"}
        </a>
      </div>
    </div>
  )
}
