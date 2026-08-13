import { describe, it, expect, vi, beforeEach } from "vitest"
import { adService } from "./adService"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: (response: { data: unknown }) => {
    const payload = response.data as { pagination?: unknown; meta?: unknown }
    if (payload.pagination) return payload.pagination
    if (payload.meta) return payload.meta
    return undefined
  },
  ApiClientError: class extends Error {},
}))

function makeAd(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: "Summer Sale",
    description: "Hot deal",
    status: "active",
    media_type: "image",
    ad_group_id: null,
    property_id: null,
    external_url: null,
    start_date: null,
    end_date: null,
    is_default: false,
    is_archived: false,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    media: [],
    ...overrides,
  }
}

describe("adService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("GETs /dashboard/ads with empty params when no filters are provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adService.list()
      expect(mockGet).toHaveBeenCalledWith("/dashboard/ads", { params: {} })
    })

    it("serializes filters into the request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adService.list({
        search: "villa",
        status: "active",
        ad_group_id: 5,
        page: 2,
        perPage: 25,
        sort_by: "created_at",
        sort_order: "desc",
      })
      const args = mockGet.mock.calls[0]
      const url = args[0] as string
      const params = args[1]?.params as Record<string, string>
      expect(url).toBe("/dashboard/ads")
      expect(params.search).toBe("villa")
      expect(params.status).toBe("active")
      expect(params.ad_group_id).toBe("5")
      expect(params.page).toBe("2")
      expect(params.perPage).toBe("25")
      expect(params.sort_by).toBe("created_at")
      expect(params.sort_order).toBe("desc")
    })

    it("returns the unwrapped data array alongside the pagination envelope", async () => {
      const pagination = {
        total: 1,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
      }
      const ads = [makeAd()]
      mockGet.mockResolvedValueOnce({ data: { data: ads, pagination } })
      const result = await adService.list()
      expect(result.data).toEqual(ads)
      expect(result.pagination).toEqual(pagination)
    })
  })

  describe("getById", () => {
    it("GETs /dashboard/ads/{id} and unwraps the data envelope", async () => {
      const ad = makeAd({ id: 42 })
      mockGet.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.getById(42)
      expect(mockGet).toHaveBeenCalledWith("/dashboard/ads/42")
      expect(result).toEqual(ad)
    })

    it("falls back to the list endpoint when the per-id route 404s", async () => {
      const ad = makeAd({ id: 7 })
      mockGet
        .mockRejectedValueOnce(new Error("not found"))
        .mockResolvedValueOnce({ data: { data: [ad] } })
      const result = await adService.getById(7)
      expect(mockGet).toHaveBeenNthCalledWith(1, "/dashboard/ads/7")
      expect(mockGet).toHaveBeenNthCalledWith(2, "/dashboard/ads", {
        params: { perPage: 100 },
      })
      expect(result).toEqual(ad)
    })
  })

  describe("create", () => {
    it("POSTs the ad payload to /dashboard/ads", async () => {
      const ad = makeAd()
      const payload = {
        title: "Summer Sale",
        description: "Hot deal",
        media_type: "image" as const,
        status: "draft" as const,
      }
      mockPost.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.create(payload)
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ads", payload)
      expect(result).toEqual(ad)
    })
  })

  describe("update", () => {
    it("PATCHes the ad payload to /dashboard/ads/{id}", async () => {
      const ad = makeAd({ title: "Updated" })
      const payload = { title: "Updated" }
      mockPatch.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.update(3, payload)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/ads/3", payload)
      expect(result).toEqual(ad)
    })
  })

  describe("archive", () => {
    it("DELETEs /dashboard/ads/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adService.archive(8)
      expect(mockDelete).toHaveBeenCalledWith("/dashboard/ads/8")
    })
  })

  describe("restore", () => {
    it("POSTs to /dashboard/ads/{id}/restore", async () => {
      const ad = makeAd()
      mockPost.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.restore(11)
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ads/11/restore")
      expect(result).toEqual(ad)
    })
  })

  describe("setStatus", () => {
    it("POSTs to /dashboard/ads/{id}/status with the status payload", async () => {
      const ad = makeAd({ status: "paused" })
      mockPost.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.setStatus(4, { status: "paused" })
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ads/4/status", {
        status: "paused",
      })
      expect(result).toEqual(ad)
    })
  })

  describe("linkProperty", () => {
    it("POSTs to /dashboard/ads/{id}/link-property with the property_id", async () => {
      const ad = makeAd({ property_id: 99 })
      mockPost.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.linkProperty(5, { property_id: 99 })
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ads/5/link-property", {
        property_id: 99,
      })
      expect(result).toEqual(ad)
    })
  })

  describe("unlinkProperty", () => {
    it("DELETEs /dashboard/ads/{id}/property", async () => {
      const ad = makeAd({ property_id: null })
      mockDelete.mockResolvedValueOnce({ data: { data: ad } })
      const result = await adService.unlinkProperty(5)
      expect(mockDelete).toHaveBeenCalledWith("/dashboard/ads/5/property")
      expect(result).toEqual(ad)
    })
  })

  describe("tracking", () => {
    it("POSTs to /ads/{id}/track/view", async () => {
      mockPost.mockResolvedValueOnce({ data: undefined })
      await adService.trackView(12)
      expect(mockPost).toHaveBeenCalledWith("/ads/12/track/view")
    })

    it("POSTs to /ads/{id}/track/visit", async () => {
      mockPost.mockResolvedValueOnce({ data: undefined })
      await adService.trackVisit(12)
      expect(mockPost).toHaveBeenCalledWith("/ads/12/track/visit")
    })
  })
})
