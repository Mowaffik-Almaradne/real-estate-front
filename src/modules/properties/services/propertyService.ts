import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import type {
  Property,
  PropertyFormData,
  PropertyFilters,
  PropertyStatistics,
  PropertyStatus,
} from "../types"

interface PropertiesPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export const propertyService = {
  async getProperties(filters: PropertyFilters = {}): Promise<{ data: Property[]; pagination: PropertiesPagination }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.rooms) params.append("rooms", filters.rooms)
    if (filters.bathrooms) params.append("bathrooms", filters.bathrooms)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.per_page) params.append("per_page", String(filters.per_page))

    const response = await apiClient.get<ApiResponse<Property[]>>("/public/properties/browse", {
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

  async getPropertyById(id: number): Promise<Property> {
    const response = await apiClient.get<ApiResponse<Property>>(`/public/properties/${id}/details`)
    return getApiData(response)
  },

  async getStatistics(): Promise<PropertyStatistics> {
    const response = await apiClient.get<ApiResponse<PropertyStatistics>>("/dashboard/properties/statistics")
    return getApiData(response)
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await apiClient.post<ApiResponse<Property>>("/dashboard/properties", data)
    return getApiData(response)
  },

  async updateProperty(id: number, data: PropertyFormData): Promise<Property> {
    const response = await apiClient.patch<ApiResponse<Property>>(`/dashboard/properties/${id}`, data)
    return getApiData(response)
  },

  async deleteProperty(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/properties/${id}`)
  },

  async updateStatus(id: number, status: PropertyStatus): Promise<Property> {
    const response = await apiClient.patch<ApiResponse<Property>>(
      `/dashboard/properties/${id}/status`,
      { status }
    )
    return getApiData(response)
  },
}
