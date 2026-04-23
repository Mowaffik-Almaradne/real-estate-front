import { apiClient } from "@/lib/apiClient"
import type {
  Property,
  PropertyFormData,
  PropertyFilters,
  PropertyStatistics,
  PropertyStatus,
} from "../types"

interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
}

interface PropertiesResponse {
  data: Property[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

interface PropertyStatisticsResponse {
  data: PropertyStatistics
}

export const propertyService = {
  async getProperties(filters: PropertyFilters = {}): Promise<{ data: Property[]; pagination: PropertiesResponse['pagination'] }> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.property_type) params.append("property_type", filters.property_type)
    if (filters.type_of_contract) params.append("type_of_contract", filters.type_of_contract)
    if (filters.rooms) params.append("rooms", filters.rooms)
    if (filters.bathrooms) params.append("bathrooms", filters.bathrooms)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.per_page) params.append("per_page", String(filters.per_page))

    const response = await apiClient.get<ApiResponse<PropertiesResponse>>(`/dashboard/properties?${params}`)
    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination,
    }
  },

  async getPropertyById(id: number): Promise<Property> {
    const response = await apiClient.get<ApiResponse<Property>>(`/dashboard/properties/${id}`)
    return response.data.data
  },

  async getStatistics(): Promise<PropertyStatistics> {
    const response = await apiClient.get<ApiResponse<PropertyStatistics>>("/dashboard/properties/statistics")
    return response.data.data
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await apiClient.post<ApiResponse<Property>>("/dashboard/properties", data)
    return response.data.data
  },

  async updateProperty(id: number, data: PropertyFormData): Promise<Property> {
    const response = await apiClient.put<ApiResponse<Property>>(`/dashboard/properties/${id}`, data)
    return response.data.data
  },

  async deleteProperty(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/properties/${id}`)
  },

  async updateStatus(id: number, status: PropertyStatus): Promise<Property> {
    const response = await apiClient.patch(`/dashboard/properties/${id}/status`, { status })
    return response.data.data
  },
}