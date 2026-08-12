import type { MapBounds, MapMarker } from "./types"
import type { PropertyDto } from "@/types/dto"

const COORD_PRECISION = 6

/**
 * Filters properties to those with valid finite coordinates.
 */
export function toMarkers(properties: PropertyDto[]): MapMarker[] {
  return properties
    .filter(
      (p): p is PropertyDto & { latitude: number; longitude: number } =>
        typeof p.latitude === "number" &&
        typeof p.longitude === "number" &&
        Number.isFinite(p.latitude) &&
        Number.isFinite(p.longitude)
    )
    .map((p) => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      property: p,
    }))
}

/**
 * Returns whether a marker is inside the given bounds (inclusive).
 */
export function pointInBounds(
  lat: number,
  lng: number,
  bounds: MapBounds
): boolean {
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  )
}

/**
 * Computes a query-string-friendly representation of the bounds.
 */
export function formatBounds(bounds: MapBounds): string {
  return [
    bounds.west.toFixed(COORD_PRECISION),
    bounds.south.toFixed(COORD_PRECISION),
    bounds.east.toFixed(COORD_PRECISION),
    bounds.north.toFixed(COORD_PRECISION),
  ].join(",")
}

/**
 * Parses a bounds string (e.g. from the URL) into a MapBounds object.
 * Returns null when the string is malformed or any value is not finite.
 */
export function parseBounds(value: string | null | undefined): MapBounds | null {
  if (!value) return null
  const parts = value.split(",").map((s) => Number(s))
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  const [west, south, east, north] = parts as [number, number, number, number]
  if (west > east || south > north) return null
  return { west, south, east, north }
}

/**
 * Serializes a marker to the GeoJSON Feature shape that supercluster expects.
 */
export function markerToFeature(marker: MapMarker) {
  return {
    type: "Feature" as const,
    properties: { marker },
    geometry: {
      type: "Point" as const,
      coordinates: [marker.lng, marker.lat] as [number, number],
    },
  }
}

/**
 * Calculates the center of a bounds object (used when restoring from URL).
 */
export function boundsCenter(bounds: MapBounds): [number, number] {
  return [(bounds.south + bounds.north) / 2, (bounds.west + bounds.east) / 2]
}