import axios from "axios"
import type {
  Property,
  PropertyFormData,
  PropertyFilters,
  PropertyStatistics,
  PropertyStatus,
} from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

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

const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

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

    const response = await publicApiClient.get<ApiResponse<PropertiesResponse>>(`/public/properties/browse?${params}`)
    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination,
    }
  },

  async getPropertyById(id: number): Promise<Property> {
    const response = await publicApiClient.get<ApiResponse<Property>>(`/public/properties/${id}/details`)
    return response.data.data
  },

  async getStatistics(): Promise<PropertyStatistics> {
    const response = await publicApiClient.get<ApiResponse<PropertyStatistics>>("/dashboard/properties/statistics")
    return response.data.data
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const token = localStorage.getItem("token")
    const response = await axios.post<ApiResponse<Property>>(
      `${API_URL}/dashboard/properties`,
      data,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    return response.data.data
  },

  async updateProperty(id: number, data: PropertyFormData): Promise<Property> {
    const token = localStorage.getItem("token")
    const response = await axios.patch<ApiResponse<Property>>(
      `${API_URL}/dashboard/properties/${id}`,
      data,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    return response.data.data
  },

  async deleteProperty(id: number): Promise<void> {
    const token = localStorage.getItem("token")
    await axios.delete(`${API_URL}/dashboard/properties/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },

  async updateStatus(id: number, status: PropertyStatus): Promise<Property> {
    const token = localStorage.getItem("token")
    const response = await axios.patch(
      `${API_URL}/dashboard/properties/${id}/status`,
      { status },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    return response.data.data
  },
}