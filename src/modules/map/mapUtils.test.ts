import { describe, it, expect } from "vitest"

import {
  boundsCenter,
  formatBounds,
  markerToFeature,
  parseBounds,
  pointInBounds,
  toMarkers,
} from "./mapUtils"
import type { PropertyDto } from "@/types/dto"

function makeProperty(overrides: { id: number; latitude?: number; longitude?: number }): PropertyDto {
  return {
    id: overrides.id,
    name: `Property ${overrides.id}`,
    description: "",
    country: { id: 1, name: "Morocco" },
    city: { id: 1, name: "Casablanca" },
    type_of_contract: "sale",
    property_type: "apartment",
    rooms: 3,
    bathrooms: 2,
    area: "120",
    price: "100000",
    formatted_price: "100,000 MAD",
    status: "approved",
    main_image: "",
    main_image_thumb: "",
    publisher: {
      id: 1,
      name: "Publisher",
      is_verified: false,
      publisher_type: "individual",
    },
    is_favorited: false,
    favorites_count: 0,
    latitude: overrides.latitude,
    longitude: overrides.longitude,
  } as PropertyDto
}

describe("mapUtils", () => {
  describe("toMarkers", () => {
    it("filters out properties missing coordinates", () => {
      const result = toMarkers([
        makeProperty({ id: 1, latitude: 33.5, longitude: -7.6 }),
        makeProperty({ id: 2, latitude: undefined, longitude: -7.6 }),
        makeProperty({ id: 3, latitude: 33.5, longitude: undefined }),
        makeProperty({ id: 4 }),
      ])
      expect(result.map((m) => m.id)).toEqual([1])
    })

    it("returns empty when no properties have coordinates", () => {
      expect(toMarkers([])).toEqual([])
      expect(toMarkers([makeProperty({ id: 1 })])).toEqual([])
    })
  })

  describe("pointInBounds", () => {
    const bounds = { west: -8, south: 33, east: -7, north: 34 }

    it("includes points inside bounds", () => {
      expect(pointInBounds(33.5, -7.5, bounds)).toBe(true)
    })

    it("excludes points outside bounds", () => {
      expect(pointInBounds(35, -7.5, bounds)).toBe(false)
      expect(pointInBounds(33.5, -9, bounds)).toBe(false)
    })

    it("includes points exactly on edge", () => {
      expect(pointInBounds(33, -7, bounds)).toBe(true)
      expect(pointInBounds(34, -8, bounds)).toBe(true)
    })
  })

  describe("formatBounds / parseBounds roundtrip", () => {
    it("roundtrips a valid bounds", () => {
      const bounds = { west: -8.123456, south: 33.234567, east: -7.345678, north: 34.456789 }
      const parsed = parseBounds(formatBounds(bounds))
      expect(parsed).not.toBeNull()
      expect(parsed?.west).toBeCloseTo(bounds.west, 5)
      expect(parsed?.south).toBeCloseTo(bounds.south, 5)
      expect(parsed?.east).toBeCloseTo(bounds.east, 5)
      expect(parsed?.north).toBeCloseTo(bounds.north, 5)
    })

    it("returns null for empty input", () => {
      expect(parseBounds("")).toBeNull()
      expect(parseBounds(null)).toBeNull()
    })

    it("returns null for malformed strings", () => {
      expect(parseBounds("1,2,3")).toBeNull()
      expect(parseBounds("a,b,c,d")).toBeNull()
      expect(parseBounds("1,2,3,4,5")).toBeNull()
    })

    it("returns null when bounds are inverted", () => {
      expect(parseBounds("-7,33,-8,34")).toBeNull()
      expect(parseBounds("-8,34,-7,33")).toBeNull()
    })
  })

  describe("boundsCenter", () => {
    it("returns the center coordinate", () => {
      expect(
        boundsCenter({ west: -8, south: 33, east: -7, north: 34 })
      ).toEqual([33.5, -7.5])
    })
  })

  describe("markerToFeature", () => {
    it("produces a GeoJSON Point feature", () => {
      const marker = toMarkers([makeProperty({ id: 1, latitude: 33.5, longitude: -7.6 })])[0]
      const feature = markerToFeature(marker)
      expect(feature.type).toBe("Feature")
      expect(feature.geometry.type).toBe("Point")
      expect(feature.geometry.coordinates).toEqual([-7.6, 33.5])
      expect(feature.properties.marker.id).toBe(1)
    })
  })
})