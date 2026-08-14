import { describe, it, expect } from "vitest"
import {
  buildAdMediaPayload,
  mediaValueFromAd,
} from "./adMediaPayload"

describe("adMediaPayload", () => {
  describe("buildAdMediaPayload", () => {
    it("returns undefined when media is null", () => {
      expect(buildAdMediaPayload(null)).toBeUndefined()
    })

    it("normalizes numeric ids", () => {
      expect(buildAdMediaPayload({ id: 99 })).toEqual([99])
    })

    it("parses digit strings to numbers", () => {
      expect(buildAdMediaPayload({ id: "123" })).toEqual([123])
    })

    it("keeps non-numeric strings as-is", () => {
      expect(buildAdMediaPayload({ id: "tmp_abc" })).toEqual(["tmp_abc"])
    })
  })

  describe("mediaValueFromAd", () => {
    it("returns null when the ad has no media", () => {
      expect(mediaValueFromAd(null)).toBeNull()
      expect(mediaValueFromAd(undefined)).toBeNull()
      expect(mediaValueFromAd({ media: [] })).toBeNull()
    })

    it("returns the first media item with its id", () => {
      expect(
        mediaValueFromAd({ media: [{ id: 1, url: "x" }, { id: 2, url: "y" }] })
      ).toMatchObject({ id: 1 })
    })

    it("returns null when the ad has no media items", () => {
      expect(mediaValueFromAd({})).toBeNull()
    })
  })
})
