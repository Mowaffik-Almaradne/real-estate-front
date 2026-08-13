import { describe, it, expect, vi, beforeEach } from "vitest"
import { adGroupService } from "./adGroupService"

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

function makeGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Hero banners",
    description: "Top of homepage",
    status: "active",
    is_archived: false,
    default_ad_id: null,
    default_ad: null,
    ads_count: 0,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("adGroupService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("GETs /dashboard/ad-groups with empty params when no filters are provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adGroupService.list()
      expect(mockGet).toHaveBeenCalledWith("/dashboard/ad-groups", { params: {} })
    })

    it("serializes filters into the request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await adGroupService.list({
        search: "hero",
        status: "active",
        page: 1,
        perPage: 10,
      })
      const args = mockGet.mock.calls[0]
      const params = args[1]?.params as Record<string, string>
      expect(params.search).toBe("hero")
      expect(params.status).toBe("active")
      expect(params.page).toBe("1")
      expect(params.perPage).toBe("10")
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
      const groups = [makeGroup()]
      mockGet.mockResolvedValueOnce({ data: { data: groups, pagination } })
      const result = await adGroupService.list()
      expect(result.data).toEqual(groups)
      expect(result.pagination).toEqual(pagination)
    })
  })

  describe("getById", () => {
    it("GETs /dashboard/ad-groups/{id} and unwraps the data envelope", async () => {
      const group = makeGroup({ id: 9 })
      mockGet.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.getById(9)
      expect(mockGet).toHaveBeenCalledWith("/dashboard/ad-groups/9")
      expect(result).toEqual(group)
    })

    it("falls back to listing when the per-id route 404s", async () => {
      const group = makeGroup({ id: 4 })
      mockGet
        .mockRejectedValueOnce(new Error("not found"))
        .mockResolvedValueOnce({ data: { data: [group] } })
      const result = await adGroupService.getById(4)
      expect(mockGet).toHaveBeenNthCalledWith(1, "/dashboard/ad-groups/4")
      expect(mockGet).toHaveBeenNthCalledWith(2, "/dashboard/ad-groups", {
        params: { perPage: 100 },
      })
      expect(result).toEqual(group)
    })
  })

  describe("create", () => {
    it("POSTs the group payload to /dashboard/ad-groups", async () => {
      const group = makeGroup()
      const payload = { name: "Hero banners" }
      mockPost.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.create(payload)
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ad-groups", payload)
      expect(result).toEqual(group)
    })
  })

  describe("update", () => {
    it("PATCHes the group payload to /dashboard/ad-groups/{id}", async () => {
      const group = makeGroup({ name: "Updated" })
      const payload = { name: "Updated" }
      mockPatch.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.update(7, payload)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/ad-groups/7", payload)
      expect(result).toEqual(group)
    })
  })

  describe("archive", () => {
    it("DELETEs /dashboard/ad-groups/{id} (archive)", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adGroupService.archive(3)
      expect(mockDelete).toHaveBeenCalledWith("/dashboard/ad-groups/3")
    })
  })

  describe("restore", () => {
    it("POSTs to /dashboard/ad-groups/{id}/restore", async () => {
      const group = makeGroup()
      mockPost.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.restore(11)
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ad-groups/11/restore")
      expect(result).toEqual(group)
    })
  })

  describe("setDefault", () => {
    it("POSTs to /dashboard/ad-groups/{id}/set-default with ad_group_id and ad_id", async () => {
      const group = makeGroup({ default_ad_id: 22 })
      mockPost.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.setDefault(1, {
        ad_group_id: 1,
        ad_id: 22,
      })
      expect(mockPost).toHaveBeenCalledWith("/dashboard/ad-groups/1/set-default", {
        ad_group_id: 1,
        ad_id: 22,
      })
      expect(result).toEqual(group)
    })
  })

  describe("removeDefault", () => {
    it("DELETEs /dashboard/ad-groups/{id}/default", async () => {
      const group = makeGroup({ default_ad_id: null })
      mockDelete.mockResolvedValueOnce({ data: { data: group } })
      const result = await adGroupService.removeDefault(2)
      expect(mockDelete).toHaveBeenCalledWith("/dashboard/ad-groups/2/default")
      expect(result).toEqual(group)
    })
  })
})
