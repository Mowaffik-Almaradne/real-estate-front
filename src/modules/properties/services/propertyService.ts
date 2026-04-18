import axios from "axios"
import type {
  Property,
  PropertyFormData,
  PropertyFilters,
  PropertyStatistics,
  PropertyStatus,
} from "../types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

    const response = await api.get<ApiResponse<PropertiesResponse>>(`/dashboard/properties?${params}`)
    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination,
    }
  },

  async getPropertyById(id: number): Promise<Property> {
    const response = await api.get<ApiResponse<Property>>(`/dashboard/properties/${id}`)
    return response.data.data
  },

  async getStatistics(): Promise<PropertyStatistics> {
    const response = await api.get<ApiResponse<PropertyStatistics>>("/dashboard/properties/statistics")
    return response.data.data
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await api.post<ApiResponse<Property>>("/dashboard/properties", data)
    return response.data.data
  },

  async updateProperty(id: number, data: PropertyFormData): Promise<Property> {
    const response = await api.put<ApiResponse<Property>>(`/dashboard/properties/${id}`, data)
    return response.data.data
  },

  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/dashboard/properties/${id}`)
  },

  async updateStatus(id: number, status: PropertyStatus): Promise<Property> {
    const response = await api.patch(`/dashboard/properties/${id}/status`, { status })
    return response.data.data
  },
}