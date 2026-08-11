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
    expect(result).toEqual(data)
  })

  it("calls the my-properties endpoint with perPage", async () => {
    await propertyService.getMyProperties({ perPage: 5, page: 1 })
    const [url, config] = mockGet.mock.calls[0]
    expect(url).toBe("/dashboard/my-properties")
    expect(config).toEqual({
      params: { perPage: "5", page: "1" },
    })
  })

  it("getFavorites sends filters to the dashboard/favorites endpoint", async () => {
    await propertyService.getFavorites({
      search: "villa",
      property_type: PropertyType.villa,
      page: 1,
      perPage: 12,
    })
    const [url, config] = mockGet.mock.calls[0]
    expect(url).toBe("/dashboard/favorites")
    expect(config).toMatchObject({
      params: expect.objectContaining({
        search: "villa",
        property_type: "villa",
        perPage: "12",
        page: "1",
      }),
    })
  })

  it("getFavorites unwraps the data envelope", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, name: "Villa" }] } })
    const result = await propertyService.getFavorites()
    expect(result.data).toEqual([{ id: 1, name: "Villa" }])
  })

  it("getFavorites falls back to empty pagination when missing", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } })
    const result = await propertyService.getFavorites()
    expect(result.data).toEqual([])
    expect(result.pagination.total).toBe(0)
  })
})
