export interface City {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface CitiesResponse {
  data: City[]
  pagination: PaginationInfo
}

export interface CityFormData {
  name: string
  is_active: boolean
}

export interface CityFilters {
  search?: string
  page?: number
  per_page?: number
}