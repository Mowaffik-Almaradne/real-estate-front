import { describe, it, expect, vi, beforeEach } from "vitest"
import { categoryService } from "./categoryService"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  ApiClientError: class extends Error {},
}))

function makeCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Apartments",
    type: "property",
    parent_id: null,
    children: [],
    properties_count: 0,
    is_protected: false,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00",
    ...overrides,
  }
}

describe("categoryService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("listPublic", () => {
    it("GETs /categories/public with empty params when no filters are provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await categoryService.listPublic()
      expect(mockGet).toHaveBeenCalledWith("/categories/public", { params: {}, silent: true })
    })

    it("serializes filters into the request params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await categoryService.listPublic({ type: "car", search: "lux" })
      const args = mockGet.mock.calls[0]
      const url = args[0] as string
      const params = args[1]?.params as Record<string, string>
      expect(url).toBe("/categories/public")
      expect(params.type).toBe("car")
      expect(params.search).toBe("lux")
    })

    it("returns the unwrapped data array", async () => {
      const items = [makeCategory()]
      mockGet.mockResolvedValueOnce({ data: { data: items } })
      const result = await categoryService.listPublic()
      expect(result).toEqual(items)
    })

    it("returns an empty array when the data field is not an array", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      const result = await categoryService.listPublic()
      expect(result).toEqual([])
    })
  })

  describe("getPublic", () => {
    it("GETs /categories/public/{id} and unwraps the data envelope", async () => {
      const category = makeCategory({ id: 42 })
      mockGet.mockResolvedValueOnce({ data: { data: category } })
      const result = await categoryService.getPublic(42)
      expect(mockGet).toHaveBeenCalledWith("/categories/public/42", { silent: true })
      expect(result).toEqual(category)
    })
  })

  describe("listAdmin", () => {
    it("GETs /categories and returns the unwrapped array", async () => {
      const items = [makeCategory({ id: 2 })]
      mockGet.mockResolvedValueOnce({ data: { data: items } })
      const result = await categoryService.listAdmin({ type: "property" })
      expect(mockGet).toHaveBeenCalledWith("/categories", {
        params: { type: "property" },
        silent: true,
      })
      expect(result).toEqual(items)
    })
  })

  describe("getTree", () => {
    it("builds a tree from the flat list response", async () => {
      const items = [
        makeCategory({ id: 1, name: "Properties", parent_id: null }),
        makeCategory({ id: 2, name: "Apartments", parent_id: 1 }),
        makeCategory({ id: 3, name: "Villas", parent_id: 1 }),
      ]
      mockGet.mockResolvedValueOnce({ data: { data: items } })
      const tree = await categoryService.getTree()
      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe(1)
      expect(tree[0].children).toHaveLength(2)
      expect(tree[0].children.map((c) => c.id).sort()).toEqual([2, 3])
    })

    it("forwards the type filter when provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await categoryService.getTree("car")
      expect(mockGet).toHaveBeenCalledWith("/categories", {
        params: { type: "car" },
        silent: true,
      })
    })
  })

  describe("create", () => {
    it("POSTs the category payload to /categories", async () => {
      const category = makeCategory()
      const payload = {
        name: "Apartments",
        type: "property" as const,
        parent_id: null,
      }
      mockPost.mockResolvedValueOnce({ data: { data: category } })
      const result = await categoryService.create(payload)
      expect(mockPost).toHaveBeenCalledWith("/categories", payload)
      expect(result).toEqual(category)
    })
  })

  describe("update", () => {
    it("PUTs the category payload to /categories/{id}", async () => {
      const category = makeCategory({ name: "Updated" })
      const payload = { name: "Updated" }
      mockPut.mockResolvedValueOnce({ data: { data: category } })
      const result = await categoryService.update(3, payload)
      expect(mockPut).toHaveBeenCalledWith("/categories/3", payload)
      expect(result).toEqual(category)
    })
  })

  describe("remove", () => {
    it("DELETEs /categories/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await categoryService.remove(8)
      expect(mockDelete).toHaveBeenCalledWith("/categories/8")
    })
  })
})
