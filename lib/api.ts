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

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Country {
  id: number
  created_at: string
  updated_at: string
  name: string
  code: string | null
  phone_code: string | null
  is_active: boolean
  cities_count?: number
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function getCountries(page: number = 1, perPage: number = 10): Promise<ApiResponse<Country[]>> {
  const response = await fetchApi<Country[]>(`/location/countries?page=${page}&perPage=${perPage}`)
  return response
}

export async function saveCountry(
  name: string,
  code: string | null,
  phoneCode: string | null,
  isActive: boolean,
  id?: number
): Promise<ApiResponse<Country>> {
  const body: Record<string, unknown> = {
    name,
    code,
    phone_code: phoneCode,
    is_active: isActive,
  }
  if (id) {
    body.id = id
  }
  return fetchApi<Country>("/location/countries", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  })
}

export async function getCities(): Promise<City[]> {
  const response = await fetchApi<City[]>("/location/cities")
  return response.data
}

export async function getCitiesByCountry(countryId: number): Promise<City[]> {
  const response = await fetchApi<City[]>(`/location/cities?country_id=${countryId}`)
  return response.data
}

export async function saveCity(
  name: string,
  countryId: number,
  stateProvince: string | null,
  postalCode: string | null,
  isActive: boolean,
  id?: number
): Promise<ApiResponse<City>> {
  const body: Record<string, unknown> = {
    name,
    country_id: countryId,
    state_provianc: stateProvince,
    postal_code: postalCode,
    is_active: isActive,
  }
  if (id) {
    body.id = id
  }
  return fetchApi<City>("/location/cities", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(body),
  })
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  })
}