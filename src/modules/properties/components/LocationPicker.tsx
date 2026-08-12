"use client"

import { useState } from "react"
import { Crosshair, MapPin, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FALLBACK_CENTER: [number, number] = [33.5731, -7.5898]
const FALLBACK_ZOOM = 12

const pinIcon = L.divIcon({
  className: "location-picker-pin",
  html: `<div style="position:relative;width:32px;height:40px"><div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div><div style="position:absolute;left:50%;top:18px;transform:translateX(-50%);width:2px;height:18px;background:#ef4444"></div></div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
})

export interface LocationValue {
  latitude: number
  longitude: number
}

export interface LocationPickerProps {
  value: LocationValue | null
  onChange: (value: LocationValue | null) => void
  className?: string
  height?: number
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ value, onChange, className, height = 280 }: LocationPickerProps) {
  const t = useTranslations("property.location")
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : FALLBACK_CENTER

  function handlePick(lat: number, lng: number) {
    onChange({ latitude: lat, longitude: lng })
  }

  function handleUseMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(t("geolocationUnavailable"))
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError(t("geolocationDenied"))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleReset() {
    onChange(null)
    setError(null)
  }

  return (
    <div className={cn("space-y-2", className)} dir="ltr">
      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={FALLBACK_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#e5e7eb" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target
                  const pos = marker.getLatLng()
                  onChange({ latitude: pos.lat, longitude: pos.lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {value ? (
          <span className="inline-flex items-center gap-1 font-mono">
            <MapPin className="size-3" />
            {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          </span>
        ) : (
          <span>{t("clickToSet")}</span>
        )}
        {error && <span className="text-destructive">{error}</span>}
        <div className="ms-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseMyLocation}
            disabled={locating}
          >
            <Crosshair className="size-3.5" />
            {locating ? t("locating") : t("useMyLocation")}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3.5" />
              {t("reset")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
