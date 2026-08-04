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
  rooms?: string
  bathrooms?: string
  min_price?: number
  max_price?: number
  page?: number
  per_page?: number
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
  async getProperties(filters: PropertyFilters = {}): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.country_id) params.append("country_id", String(filters.country_id))
    if (filters.city_id) params.append("city_id", String(filters.city_id))
    if (filters.publisher_id) params.append("publisher_id", String(filters.publisher_id))
    if (filters.rooms) params.append("rooms", filters.rooms)
    if (filters.bathrooms) params.append("bathrooms", filters.bathrooms)
    if (filters.min_price) params.append("min_price", String(filters.min_price))
    if (filters.max_price) params.append("max_price", String(filters.max_price))
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)
    if (filters.page) params.append("page", String(filters.page))
    const perPage = filters.per_page ?? filters.perPage
    if (perPage) params.append("perPage", String(perPage))

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/public/properties/browse", {
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

  async getMyProperties(filters: PropertyFilters = {}): Promise<{ data: PropertyDto[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.rooms) params.append("rooms", filters.rooms)
    if (filters.bathrooms) params.append("bathrooms", filters.bathrooms)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.per_page) params.append("per_page", String(filters.per_page))

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>(
      "/dashboard/properties/my",
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

  async getPropertyById(id: number): Promise<PropertyDto> {
    const response = await apiClient.get<ApiResponse<PropertyDto>>(`/public/properties/${id}/details`)
    return getApiData(response)
  },

  async getStatistics(): Promise<PropertyStatisticsDto> {
    const response = await apiClient.get<ApiResponse<PropertyStatisticsDto>>("/dashboard/properties/statistics")
    return getApiData(response)
  },

  async createProperty(data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.post<ApiResponse<PropertyDto>>("/dashboard/properties", data)
    return getApiData(response)
  },

  async updateProperty(id: number, data: PropertyFormData): Promise<PropertyDto> {
    const response = await apiClient.patch<ApiResponse<PropertyDto>>(`/dashboard/properties/${id}`, data)
    return getApiData(response)
  },

  async deleteProperty(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/properties/${id}`)
  },

  async updateStatus(id: number, status: PropertyStatus): Promise<PropertyDto> {
    const response = await apiClient.patch<ApiResponse<PropertyDto>>(
      `/dashboard/properties/${id}/status`,
      { status }
    )
    return getApiData(response)
  },

  async toggleFavorite(id: number): Promise<FavoriteToggleResponse> {
    const response = await apiClient.post<ApiResponse<FavoriteToggleResponse>>(
      `/dashboard/properties/${id}/favorite`
    )
    return getApiData(response)
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
