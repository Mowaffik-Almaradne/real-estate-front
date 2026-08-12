import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  filterToParams,
  sortFilters,
  type PropertyFilters,
} from "./propertyService"
import { PropertyStatus, PropertyType, TypeOfContract } from "@/types/enums"

describe("sortFilters", () => {
  it("returns the filters unchanged when sort_by and sort_order are set", () => {
    const filters: PropertyFilters = { sort_by: "price", sort_order: "asc" }
    expect(sortFilters(filters)).toEqual(filters)
  })

  it("expands a combined sort string", () => {
    const result = sortFilters({ sort_by: "price:desc" } as PropertyFilters)
    expect(result.sort_by).toBe("price")
    expect(result.sort_order).toBe("desc")
  })

  it("falls back to created_at desc when nothing is set", () => {
    const result = sortFilters({})
    expect(result.sort_by).toBe("created_at")
    expect(result.sort_order).toBe("desc")
  })
})

describe("filterToParams", () => {
  it("drops empty values", () => {
    const params = filterToParams({
      search: "",
      country_id: undefined,
      sort_by: "price",
      sort_order: "asc",
    })
    expect(params).toEqual({ sort_by: "price", sort_order: "asc" })
  })

  it("stringifies numbers and enums", () => {
    const params = filterToParams({
      search: "apartment",
      country_id: 5,
      city_id: 12,
      rooms_min: 2,
      rooms_max: 5,
      bathrooms_min: 1,
      area_min: 50,
      area_max: 200,
      price_min: 100,
      price_max: 1000,
      property_type: PropertyType.apartment,
      type_of_contract: TypeOfContract.rent,
      status: PropertyStatus.approved,
      page: 2,
      perPage: 20,
      sort_by: "price",
      sort_order: "asc",
    })
    expect(params).toEqual({
      search: "apartment",
      country_id: "5",
      city_id: "12",
      rooms_min: "2",
      rooms_max: "5",
      bathrooms_min: "1",
      area_min: "50",
      area_max: "200",
      price_min: "100",
      price_max: "1000",
      property_type: "apartment",
      type_of_contract: "rent",
      status: "approved",
      page: "2",
      perPage: "20",
      sort_by: "price",
      sort_order: "asc",
    })
  })
})

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
  getApiPagination: () => undefined,
  ApiClientError: class extends Error {},
}))

import { propertyService } from "./propertyService"

describe("propertyService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue({ data: { data: [] } })
    mockPost.mockResolvedValue({ data: { data: null } })
    mockPatch.mockResolvedValue({ data: { data: null } })
    mockDelete.mockResolvedValue({ data: { data: null } })
  })

  it("calls the browse endpoint with the documented query param names", async () => {
    await propertyService.getProperties({
      search: "villa",
      price_min: 100,
      price_max: 500,
      rooms_min: 3,
      bathrooms_min: 2,
      area_min: 80,
      area_max: 300,
      country_id: 1,
      city_id: 2,
      property_type: PropertyType.villa,
      type_of_contract: TypeOfContract.sale,
      page: 1,
      perPage: 12,
      sort_by: "price",
      sort_order: "asc",
    })

    expect(mockGet).toHaveBeenCalledTimes(1)
    const [url, config] = mockGet.mock.calls[0]
    expect(url).toBe("/properties/browse")
    expect(config).toEqual({
      params: {
        search: "villa",
        price_min: "100",
        price_max: "500",
        rooms_min: "3",
        bathrooms_min: "2",
        area_min: "80",
        area_max: "300",
        country_id: "1",
        city_id: "2",
        property_type: "villa",
        type_of_contract: "sale",
        sort_by: "price",
        sort_order: "asc",
        page: "1",
        perPage: "12",
      },
    })
  })

  it("calls the public details endpoint", async () => {
    await propertyService.getPropertyById(42)
    expect(mockGet).toHaveBeenCalledWith("/properties/42/details")
  })

  it("calls the random endpoint", async () => {
    const data = [{ id: 1 }]
    mockGet.mockResolvedValueOnce({ data: { data } })
    const result = await propertyService.getRandomProperties()
    expect(mockGet).toHaveBeenCalledWith("/properties/random")
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 1,
      main_image: expect.stringContaining("images.unsplash.com"),
    })
  })

  it("calls the my-properties endpoint with perPage", async () => {
    await propertyService.getMyProperties({ perPage: 5, page: 1 })
    const [url, config] = mockGet.mock.calls[0]
    expect(url).toBe("/dashboard/my-properties")
    expect(config).toEqual({
      params: { perPage: "5", page: "1" },
    })
  })

  it("getFavorites loads property details for local favorite ids", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 14,
            name: "Villa",
            property_type: "villa",
            main_image: null,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 9,
            name: "Apt",
            property_type: "apartment",
            main_image: null,
          },
        },
      })
    const result = await propertyService.getFavorites({ ids: [14, 9], page: 1, perPage: 12 })
    expect(mockGet).toHaveBeenCalledWith("/properties/14/details")
    expect(mockGet).toHaveBeenCalledWith("/properties/9/details")
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toMatchObject({
      id: 14,
      is_favorited: true,
      main_image: expect.stringContaining("images.unsplash.com"),
    })
  })

  it("getFavorites returns empty when no local ids", async () => {
    const result = await propertyService.getFavorites({ page: 1, perPage: 12 })
    expect(mockGet).not.toHaveBeenCalled()
    expect(result.data).toEqual([])
    expect(result.pagination.total).toBe(0)
  })

  it("toggleFavorite works locally without calling missing API routes", async () => {
    const result = await propertyService.toggleFavorite(14, false)
    expect(mockPost).not.toHaveBeenCalled()
    expect(result).toEqual({ favorited: true, favorites_count: 0 })
  })
})
