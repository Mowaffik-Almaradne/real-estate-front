import { describe, expect, it } from "vitest"
import {
  getPropertyFallbackImage,
  resolvePropertyImage,
  withPropertyImages,
} from "@/lib/property-images"

describe("property-images", () => {
  it("returns a stable internet url for a given id", () => {
    const a = getPropertyFallbackImage(12, "villa")
    const b = getPropertyFallbackImage(12, "villa")
    expect(a).toBe(b)
    expect(a).toMatch(/picsum\.photos|images\.unsplash\.com/)
  })

  it("prefers backend images when present", () => {
    expect(
      resolvePropertyImage({
        id: 1,
        property_type: "apartment",
        main_image: "https://cdn.example.com/full.jpg",
        main_image_thumb: "https://cdn.example.com/thumb.jpg",
      })
    ).toBe("https://cdn.example.com/thumb.jpg")
  })

  it("forceFallback always uses fake internet images", () => {
    expect(
      resolvePropertyImage(
        {
          id: 5,
          property_type: "house",
          main_image: "https://cdn.example.com/real.jpg",
          main_image_thumb: "https://cdn.example.com/real-thumb.jpg",
        },
        { forceFallback: true }
      )
    ).toMatch(/picsum\.photos|images\.unsplash\.com/)
  })

  it("fills empty-string backend images with fallbacks", () => {
    const filled = withPropertyImages({
      id: 11,
      property_type: "house",
      main_image: "",
      main_image_thumb: "",
    })
    expect(filled.main_image).toMatch(/picsum\.photos|images\.unsplash\.com/)
    expect(filled.main_image_thumb).toMatch(/picsum\.photos|images\.unsplash\.com/)
  })

  it("fills missing images without overwriting existing ones", () => {
    const filled = withPropertyImages({
      id: 3,
      property_type: "house",
      main_image: null,
      main_image_thumb: null,
    })
    expect(filled.main_image).toMatch(/picsum\.photos|images\.unsplash\.com/)
    expect(filled.main_image_thumb).toMatch(/picsum\.photos|images\.unsplash\.com/)

    const kept = withPropertyImages({
      id: 3,
      property_type: "house",
      main_image: "https://cdn.example.com/a.jpg",
      main_image_thumb: null,
    })
    expect(kept.main_image).toBe("https://cdn.example.com/a.jpg")
  })
})
