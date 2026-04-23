import { apiClient } from "@/lib/apiClient"
import type { City, CityFormData, CityFilters, CitiesResponse } from "../types"

export const cityService = {
  async getCities(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.per_page) params.append('per_page', String(filters.per_page))

    const response = await apiClient.get<CitiesResponse>(`/dashboard/cities?${params.toString()}`)
    return response.data
  },

  async getCityById(id: number): Promise<City> {
    const response = await apiClient.get<City>(`/dashboard/cities/${id}`)
    return response.data
  },

  async createCity(data: CityFormData): Promise<City> {
    const response = await apiClient.post<City>('/dashboard/cities', data)
    return response.data
  },

  async updateCity(id: number, data: CityFormData): Promise<City> {
    const response = await apiClient.put<City>(`/dashboard/cities/${id}`, data)
    return response.data
  },

  async deleteCity(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/cities/${id}`)
  },
}