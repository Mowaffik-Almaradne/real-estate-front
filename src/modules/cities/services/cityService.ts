import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import type { City, CityFormData, CityFilters, CitiesResponse } from "../types"

export const cityService = {
  async getCities(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.per_page) params.append('per_page', String(filters.per_page))

    const response = await apiClient.get<ApiResponse<City[]>>(`/location/cities?${params.toString()}`)
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: {
        total: pagination?.total ?? 0,
        per_page: pagination?.per_page ?? filters.per_page ?? 15,
        current_page: pagination?.current_page ?? filters.page ?? 1,
        last_page: pagination?.last_page ?? 1,
      },
    }
  },

  async getCityById(id: number): Promise<City> {
    const response = await apiClient.get<ApiResponse<City>>(`/location/cities/${id}`)
    return getApiData(response)
  },

  async createCity(data: CityFormData): Promise<City> {
    const response = await apiClient.post<ApiResponse<City>>('/location/cities', data)
    return getApiData(response)
  },

  async updateCity(id: number, data: CityFormData): Promise<City> {
    const response = await apiClient.put<ApiResponse<City>>(`/location/cities/${id}`, data)
    return getApiData(response)
  },

  async deleteCity(id: number): Promise<void> {
    await apiClient.delete(`/location/cities/${id}`)
  },
}
