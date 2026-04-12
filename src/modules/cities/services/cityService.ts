import axios from 'axios'
import type { City, CityFormData, CityFilters, CitiesResponse } from '../types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const cityService = {
  async getCities(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.per_page) params.append('per_page', String(filters.per_page))

    const response = await api.get<CitiesResponse>(`/cities?${params.toString()}`)
    return response.data
  },

  async getCityById(id: number): Promise<City> {
    const response = await api.get<City>(`/cities/${id}`)
    return response.data
  },

  async createCity(data: CityFormData): Promise<City> {
    const response = await api.post<City>('/cities', data)
    return response.data
  },

  async updateCity(id: number, data: CityFormData): Promise<City> {
    const response = await api.put<City>(`/cities/${id}`, data)
    return response.data
  },

  async deleteCity(id: number): Promise<void> {
    await api.delete(`/cities/${id}`)
  },
}