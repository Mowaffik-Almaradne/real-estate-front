const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
  pagination?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

export interface Country {
  id: number
  created_at: string
  updated_at: string
  name: string
}

export interface City {
  id: number
  created_at: string
  updated_at: string
  name: string
  country_id: number | null
  state_provianc: string | null
  postal_code: string | null
  is_active: boolean
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getCountries(): Promise<Country[]> {
  const response = await fetchApi<Country[]>("/location/countries")
  return response.data
}

export async function getCities(): Promise<City[]> {
  const response = await fetchApi<City[]>("/location/cities")
  return response.data
}