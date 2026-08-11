"use client"

import { useEffect, useMemo, useState } from "react"
import Supercluster from "supercluster"

import {
  CLUSTER_RADIUS,
  MAX_CLUSTER_ZOOM,
  MIN_CLUSTER_ZOOM,
  type ClusterPoint,
  type MapBounds,
  type MapMarker,
} from "./types"
import { markerToFeature } from "./mapUtils"

export interface UseClusteredMarkersResult {
  clusters: ClusterPoint[]
  getExpansionZoom: (clusterId: number) => number | null
}

export interface UseClusteredMarkersParams {
  markers: MapMarker[]
  bounds: MapBounds | null
  zoom: number
}

/**
 * Clusters the supplied markers using `supercluster` against the current map
 * viewport bounds + zoom. Returns a list of points (clusters or singles)
 * ready to be rendered as markers on a Leaflet map.
 */
export function useClusteredMarkers({
  markers,
  bounds,
  zoom,
}: UseClusteredMarkersParams): UseClusteredMarkersResult {
  const cluster = useMemo(() => {
    const index = new Supercluster({
      radius: CLUSTER_RADIUS,
      minZoom: MIN_CLUSTER_ZOOM,
      maxZoom: MAX_CLUSTER_ZOOM,
    })
    const features = markers.map(markerToFeature)
    index.load(features)
    return index
  }, [markers])

  const [clusters, setClusters] = useState<ClusterPoint[]>(() =>
    computeClusters(cluster, bounds, zoom, markers)
  )

  useEffect(() => {
    void Promise.resolve().then(() => {
      setClusters(computeClusters(cluster, bounds, zoom, markers))
    })
  }, [cluster, bounds, zoom, markers])

  const getExpansionZoom = (clusterId: number): number | null => {
    try {
      return cluster.getClusterExpansionZoom(clusterId)
    } catch {
      return null
    }
  }

  return { clusters, getExpansionZoom }
}

function computeClusters(
  cluster: Supercluster,
  bounds: MapBounds | null,
  zoom: number,
  markers: MapMarker[]
): ClusterPoint[] {
  if (markers.length === 0) return []
  if (!bounds) {
    return markers.map((m) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      count: 1,
      isCluster: false,
      markers: [m],
    }))
  }

  const bbox: [number, number, number, number] = [
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north,
  ]

  return cluster.getClusters(bbox, Math.round(zoom)).map((feature) => {
    const [lng, lat] = feature.geometry.coordinates as [number, number]
    const props = feature.properties as
      | { cluster?: boolean; cluster_id?: number; point_count?: number; marker?: MapMarker }
      | undefined

    if (props?.cluster && typeof props.cluster_id === "number") {
      const clusterMarkers = cluster.getLeaves(props.cluster_id, Infinity) as unknown as Array<{
        properties: { marker: MapMarker }
      }>
      const all = clusterMarkers.map((leaf) => leaf.properties.marker)
      return {
        id: props.cluster_id,
        lat,
        lng,
        count: props.point_count ?? all.length,
        isCluster: true,
        markers: all,
      }
    }

    const marker = props?.marker
    const id = marker?.id ?? -Math.floor((lat + lng) * 10000) - 1
    return {
      id,
      lat,
      lng,
      count: 1,
      isCluster: false,
      markers: marker ? [marker] : [],
    }
  })
}