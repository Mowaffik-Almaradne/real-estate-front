import type { PropertyDto } from "@/types/dto"

export interface MapBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface MapMarker {
  id: number
  lat: number
  lng: number
  property: PropertyDto
}

export interface ClusterPoint {
  id: number
  lat: number
  lng: number
  count: number
  isCluster: boolean
  markers: MapMarker[]
}

export const DEFAULT_MAP_CENTER: [number, number] = [33.5731, -7.5898]
export const DEFAULT_MAP_ZOOM = 12
export const MIN_CLUSTER_ZOOM = 0
export const MAX_CLUSTER_ZOOM = 18
export const CLUSTER_RADIUS = 60
export const BOUNDS_DEBOUNCE_MS = 300