import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import {
  normalizeProperty,
  normalizePropertyList,
} from "@/lib/property-images"
import type {
  FavoriteToggleResponse,
  PropertyDto,
  PropertyFormData,
  PropertyStatisticsDto,
} from "@/types/dto"
import { PropertyStatus, PropertyType, TypeOfContract } from "@/types/enums"

export interface PropertyFilters {
  search?: string
  status?: PropertyStatus
  property_type?: PropertyType
  type_of_contract?: TypeOfContract
  country_id?: number
  city_id?: number
  publisher_id?: number
  rooms_min?: number
  rooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  area_min?: number
  area_max?: number
  price_min?: number
  price_max?: number
  page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface PropertiesPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface CreateWithPhotographerRequest extends PropertyFormData {
  provider_id: number
  scheduled_at: string
  photographer_notes?: string
  photographer_price?: number
}

export const propertyService = {
  /**
   * Browse public property listings with filters and pagination.
   * Hits the public `/properties/browse` endpoint.
   */
  async getProperties(filters: PropertyFilters = {}): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.country_id) params.append("country_id", String(filters.country_id))
    if (filters.city_id) params.append("city_id", String(filters.city_id))
    if (filters.publisher_id) params.append("publisher_id", String(filters.publisher_id))
    if (filters.rooms_min) params.append("rooms_min", String(filters.rooms_min))
    if (filters.rooms_max) params.append("rooms_max", String(filters.rooms_max))
    if (filters.bathrooms_min) params.append("bathrooms_min", String(filters.bathrooms_min))
    if (filters.bathrooms_max) params.append("bathrooms_max", String(filters.bathrooms_max))
    if (filters.area_min) params.append("area_min", String(filters.area_min))
    if (filters.area_max) params.append("area_max", String(filters.area_max))
    if (filters.price_min) params.append("price_min", String(filters.price_min))
    if (filters.price_max) params.append("price_max", String(filters.price_max))
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/properties/browse", {
      params: Object.fromEntries(params),
    })
    const pagination = getApiPagination(response)
    return {
      data: normalizePropertyList(getApiData(response), { forceFallback: true }),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      },
    }
  },

  /**
   * Fetch the authenticated user's own property listings (dashboard view).
   * Includes only properties owned by the current user.
   */
  async getMyProperties(filters: PropertyFilters = {}): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.rooms_min) params.append("rooms_min", String(filters.rooms_min))
    if (filters.rooms_max) params.append("rooms_max", String(filters.rooms_max))
    if (filters.bathrooms_min) params.append("bathrooms_min", String(filters.bathrooms_min))
    if (filters.bathrooms_max) params.append("bathrooms_max", String(filters.bathrooms_max))
    if (filters.price_min) params.append("price_min", String(filters.price_min))
    if (filters.price_max) params.append("price_max", String(filters.price_max))
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>(
      "/dashboard/my-properties",
      { params: Object.fromEntries(params) }
    )
    const pagination = getApiPagination(response)
    return {
      data: normalizePropertyList(getApiData(response)),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      },
    }
  },

  /**
   * Fetch a single property's full details by ID.
   * @throws if the property does not exist or the user lacks permission.
   */
  async getPropertyById(id: number): Promise<PropertyDto> {
    const response = await apiClient.get<ApiResponse<PropertyDto>>(`/properties/${id}/details`)
    return normalizeProperty(getApiData(response))
  },

/**
   * Fetch a randomized batch of properties for the homepage carousel.
   */
  async getRandomProperties(): Promise<PropertyDto[]> {
    const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/properties/random")
    return normalizePropertyList(getApiData(response), { forceFallback: true })
  },
  /**
   * Aggregate counts of the user's properties grouped by status.
   * Prefer publisher stats; fall back to dashboard stats; finally derive from my-properties.
   */
  async getStatistics(): Promise<PropertyStatisticsDto> {
    const empty: PropertyStatisticsDto = {
      draft: 0,
      pending: 0,
      under_inspection: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
      sold: 0,
      archived: 0,
      all: 0,
    }

    try {
      const response = await apiClient.get<ApiResponse<Partial<PropertyStatisticsDto> & Record<string, number>>>(
        "/publisher/statistics",
        { silent: true }
      )
      const data = getApiData(response) ?? {}
      return {
        ...empty,
        ...data,
        all:
          data.all ??
          Object.values(data).reduce((sum, value) => sum + (typeof value === "number" ? value : 0), 0),
      }
    } catch {
      // continue
    }

    try {
      const response = await apiClient.get<ApiResponse<PropertyStatisticsDto>>(
        "/dashboard/properties/statistics",
        { silent: true }
      )
      return getApiData(response)
    } catch {
      // continue
    }

    try {
      const mine = await this.getMyProperties({ perPage: 100 })
      const counts = { ...empty }
      for (const property of mine.data) {
        const key = property.status as keyof PropertyStatisticsDto
        if (key in counts && typeof counts[key] === "number") {
          counts[key] = (counts[key] as number) + 1
        }
        counts.all += 1
      }
      return counts
    } catch {
      return empty
    }
  },

/**
   * Create a new property listing. Returns the freshly created DTO.
   */
  async createProperty(data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.post<ApiResponse<PropertyDto>>("/properties/create", data)
    return normalizeProperty(getApiData(response))
  },

  /**
   * Update an existing property by ID. Sends the full form payload.
   */
  async updateProperty(id: number, data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.put<ApiResponse<PropertyDto>>(`/properties/${id}`, data)
    return normalizeProperty(getApiData(response))
  },

  /**
   * Permanently delete a property by ID.
   */
  async deleteProperty(id: number): Promise<void> {
    await apiClient.delete(`/properties/${id}`)
  },

  /**
   * Update the moderation status of a property (approved/rejected/sold/etc).
   */
  async updateStatus(id: number, status: PropertyStatus): Promise<PropertyDto> {
    const response = await apiClient.patch<ApiResponse<PropertyDto>>(
      `/dashboard/properties/${id}/status`,
      { status }
    )
    return normalizeProperty(getApiData(response))
  },

  /**
   * Toggle favorite/love for a property.
   *
   * Backend OpenAPI (`docs/backend/api-documentation/openapi.yaml`) only documents:
   *   POST /api/dashboard/properties/{id}/favorite
   * That route exists but returns 403 for normal users.
   * The consumer route POST /api/properties/{id}/favorite is NOT on this backend (404).
   *
   * So we persist favorites locally and load property payloads from
   * GET /api/properties/{id}/details (with network image fallbacks).
   */
  async toggleFavorite(
    id: number,
    currentlyFavorited = false
  ): Promise<FavoriteToggleResponse> {
    void id
    return {
      favorited: !currentlyFavorited,
      favorites_count: 0,
    }
  },

  /**
   * Load favorited properties by local ids via OpenAPI details endpoint.
   * GET /api/properties/{id}/details + network image fallbacks.
   */
  async getFavorites(
    filters: PropertyFilters & { ids?: number[] } = {}
  ): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const ids = (filters.ids ?? []).filter((id) => Number.isFinite(id) && id > 0)
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 12

    if (ids.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          per_page: perPage,
          current_page: page,
          last_page: 1,
          from: null,
          to: null,
        },
      }
    }

    const uniqueIds = Array.from(new Set(ids))
    const settled = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          return await this.getPropertyById(id)
        } catch {
          return null
        }
      })
    )
    let items = settled.filter((item): item is PropertyDto => item != null)

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.city?.name?.toLowerCase().includes(q)
      )
    }
    if (filters.property_type) {
      items = items.filter((p) => p.property_type === filters.property_type)
    }
    if (filters.type_of_contract) {
      items = items.filter((p) => p.type_of_contract === filters.type_of_contract)
    }

    const total = items.length
    const start = (page - 1) * perPage
    const slice = items.slice(start, start + perPage)
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    return {
      data: normalizePropertyList(slice).map((p) => ({ ...p, is_favorited: true })),
      pagination: {
        total,
        per_page: perPage,
        current_page: page,
        last_page: lastPage,
        from: total === 0 ? null : start + 1,
        to: total === 0 ? null : Math.min(start + perPage, total),
      },
    }
  },

  async createWithPhotographer(
    request: CreateWithPhotographerRequest
  ): Promise<PropertyDto> {
    const response = await apiClient.post<ApiResponse<PropertyDto>>(
      "/dashboard/properties/with-photographer",
      request
    )
    return normalizeProperty(getApiData(response))
  },
}

export function sortFilters(filters: PropertyFilters): PropertyFilters {
  if (!filters.sort_by && !filters.sort_order) {
    return { ...filters, sort_by: "created_at", sort_order: "desc" }
  }
  if (filters.sort_by && filters.sort_order) return filters
  const raw = filters.sort_by ?? "created_at:desc"
  const [sort_by, sort_order] = raw.split(":")
  return {
    ...filters,
    sort_by,
    sort_order: (sort_order as "asc" | "desc" | undefined) ?? "desc",
  }
}

export function filterToParams(filters: PropertyFilters): Record<string, string> {
  const sorted = sortFilters(filters)
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(sorted)) {
    if (value === undefined || value === null || value === "") continue
    params[key] = String(value)
  }
  return params
}
