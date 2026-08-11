import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import type { CitiesResponse, CityDto, CityFilters, CityFormData } from "@/types/dto"

export type { CitiesResponse, CityDto, CityFilters, CityFormData }

export const cityService = {
  /**
   * Browse all cities with optional search and pagination.
   */
  async getCities(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.per_page) params.append("per_page", String(filters.per_page))

    const response = await apiClient.get<ApiResponse<CityDto[]>>(`/location/cities?${params.toString()}`)
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
      },
    }
  },

  /**
   * Fetch a single city by ID.
   */
  async getCityById(id: number): Promise<CityDto> {
    const response = await apiClient.get<ApiResponse<CityDto>>(`/location/cities/${id}`)
    return getApiData(response)
  },

  /**
   * Create a new city (admin action).
   */
  async createCity(data: CityFormData): Promise<CityDto> {
    const response = await apiClient.post<ApiResponse<CityDto>>("/location/cities", data)
    return getApiData(response)
  },

  /**
   * Update an existing city (admin action).
   */
  async updateCity(id: number, data: CityFormData): Promise<CityDto> {
    const response = await apiClient.put<ApiResponse<CityDto>>(`/location/cities/${id}`, data)
    return getApiData(response)
  },

  async deleteCity(id: number): Promise<void> {
    await apiClient.delete(`/location/cities/${id}`)
  },
}
