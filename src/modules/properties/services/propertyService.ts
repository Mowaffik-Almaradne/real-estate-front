import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
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
      data: getApiData(response),
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
      data: getApiData(response),
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
    return getApiData(response)
  },

/**
   * Fetch a randomized batch of properties for the homepage carousel.
   */
  async getRandomProperties(): Promise<PropertyDto[]> {
    const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/properties/random")
    return getApiData(response)
  },
  /**
   * Aggregate counts of the user's properties grouped by status
   * (pending, approved, rejected, suspended, sold, archived, all).
   */
  async getStatistics(): Promise<PropertyStatisticsDto> {
    const response = await apiClient.get<ApiResponse<PropertyStatisticsDto>>("/dashboard/properties/statistics")
    return getApiData(response)
  },

/**
   * Create a new property listing. Returns the freshly created DTO.
   */
  async createProperty(data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.post<ApiResponse<PropertyDto>>("/properties/create", data)
    return getApiData(response)
  },

  /**
   * Update an existing property by ID. Sends the full form payload.
   */
  async updateProperty(id: number, data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.put<ApiResponse<PropertyDto>>(`/properties/${id}`, data)
    return getApiData(response)
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
    return getApiData(response)
  },

  /**
   * Toggle the favorite status of a property for the current user.
   * Returns whether the property is now favorited plus updated counters.
   */
  async toggleFavorite(id: number): Promise<FavoriteToggleResponse> {
    const response = await apiClient.post<ApiResponse<FavoriteToggleResponse>>(
      `/dashboard/properties/${id}/favorite`
    )
    return getApiData(response)
  },

  async getFavorites(
    filters: PropertyFilters = {}
  ): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.country_id) params.append("country_id", String(filters.country_id))
    if (filters.city_id) params.append("city_id", String(filters.city_id))
    if (filters.rooms_min) params.append("rooms_min", String(filters.rooms_min))
    if (filters.rooms_max) params.append("rooms_max", String(filters.rooms_max))
    if (filters.bathrooms_min) params.append("bathrooms_min", String(filters.bathrooms_min))
    if (filters.bathrooms_max) params.append("bathrooms_max", String(filters.bathrooms_max))
    if (filters.price_min) params.append("price_min", String(filters.price_min))
    if (filters.price_max) params.append("price_max", String(filters.price_max))
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>(
      "/dashboard/favorites",
      { params: Object.fromEntries(params) }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
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

  async createWithPhotographer(
    request: CreateWithPhotographerRequest
  ): Promise<PropertyDto> {
    const response = await apiClient.post<ApiResponse<PropertyDto>>(
      "/dashboard/properties/with-photographer",
      request
    )
    return getApiData(response)
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
