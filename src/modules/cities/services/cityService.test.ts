import { describe, it, expect, vi, beforeEach } from "vitest"
import { cityService } from "./cityService"

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
  getApiPagination: (response: { data: unknown }) => {
    const payload = response.data as { pagination?: unknown; meta?: unknown; data?: unknown }
    if (payload.pagination) return payload.pagination
    if (payload.meta) return payload.meta
    return undefined
  },
}))

function makeCity(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Riyadh",
    country_id: 1,
    state_province: null,
    postal_code: null,
    is_active: true,
    ...overrides,
  }
}

describe("cityService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getCities", () => {
    it("GETs /location/cities with no params when called with empty filters", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await cityService.getCities()
      expect(mockGet).toHaveBeenCalledWith("/location/cities?")
    })

    it("appends search, page, and per_page query params", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await cityService.getCities({ search: "Casablanca", page: 2, per_page: 25 })
      const url = mockGet.mock.calls[0][0] as string
      expect(url).toMatch(/^\/location\/cities\?/)
      const params = new URLSearchParams(url.split("?")[1])
      expect(params.get("search")).toBe("Casablanca")
      expect(params.get("page")).toBe("2")
      expect(params.get("per_page")).toBe("25")
    })

    it("omits params that are not provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await cityService.getCities({ search: "Fez" })
      const url = mockGet.mock.calls[0][0] as string
      const params = new URLSearchParams(url.split("?")[1])
      expect(params.get("search")).toBe("Fez")
      expect(params.get("page")).toBeNull()
      expect(params.get("per_page")).toBeNull()
    })

    it("returns the unwrapped data array alongside the pagination envelope", async () => {
      const pagination = {
        total: 50,
        per_page: 10,
        current_page: 1,
        last_page: 5,
        from: 1,
        to: 10,
      }
      const cities = [makeCity()]
      mockGet.mockResolvedValueOnce({ data: { data: cities, pagination } })
      const result = await cityService.getCities()
      expect(result.data).toEqual(cities)
      expect(result.pagination).toEqual(pagination)
    })
  })

  describe("getCityById", () => {
    it("GETs the city by id and unwraps the data envelope", async () => {
      const city = makeCity({ id: 7 })
      mockGet.mockResolvedValueOnce({ data: { data: city } })
      const result = await cityService.getCityById(7)
      expect(mockGet).toHaveBeenCalledWith("/location/cities/7")
      expect(result).toEqual(city)
    })
  })

  describe("createCity", () => {
    it("POSTs the city payload to /location/cities", async () => {
      const city = makeCity()
      const payload = {
        name: "Riyadh",
        country_id: 1,
        state_province: "Riyadh Province" as string | null,
        postal_code: "11564" as string | null,
        is_active: true,
      }
      mockPost.mockResolvedValueOnce({ data: { data: city } })
      const result = await cityService.createCity(payload)
      expect(mockPost).toHaveBeenCalledWith("/location/cities", payload)
      expect(result).toEqual(city)
    })
  })

  describe("updateCity", () => {
    it("PUTs the city payload to /location/cities/{id}", async () => {
      const city = makeCity({ name: "Riyadh Updated" })
      const payload = {
        name: "Riyadh Updated",
        country_id: 1,
        state_province: null,
        postal_code: null,
        is_active: true,
      }
      mockPut.mockResolvedValueOnce({ data: { data: city } })
      const result = await cityService.updateCity(7, payload)
      expect(mockPut).toHaveBeenCalledWith("/location/cities/7", payload)
      expect(result).toEqual(city)
    })
  })

  describe("deleteCity", () => {
    it("DELETEs the city by id", async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await cityService.deleteCity(7)
      expect(mockDelete).toHaveBeenCalledWith("/location/cities/7")
    })
  })
})
