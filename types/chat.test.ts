import { describe, it, expect } from "vitest"
import { isImageMime, isAcceptedMime, MAX_ATTACHMENT_SIZE } from "@/types/chat"

describe("chat type helpers", () => {
  it("identifies image MIME types", () => {
    expect(isImageMime("image/jpeg")).toBe(true)
    expect(isImageMime("image/png")).toBe(true)
    expect(isImageMime("image/webp")).toBe(true)
  })

  it("rejects non-image MIME types", () => {
    expect(isImageMime("application/pdf")).toBe(false)
    expect(isImageMime(undefined)).toBe(false)
  })

  it("identifies accepted MIME types", () => {
    expect(isAcceptedMime("image/png")).toBe(true)
    expect(isAcceptedMime("application/pdf")).toBe(true)
    expect(isAcceptedMime("text/plain")).toBe(true)
  })

  it("rejects unsupported MIME types", () => {
    expect(isAcceptedMime("application/x-executable")).toBe(false)
    expect(isAcceptedMime(undefined)).toBe(false)
  })

  it("exposes MAX_ATTACHMENT_SIZE = 10MB", () => {
    expect(MAX_ATTACHMENT_SIZE).toBe(10 * 1024 * 1024)
  })
})