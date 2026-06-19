import { apiClient, API_URL } from "./apiClient"

export { apiClient } from "./apiClient"
export { API_URL }

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

export async function getCountries(page: number = 1, perPage: number = 10): Promise<ApiResponse<Country[]>> {
  const response = await apiClient.get<ApiResponse<Country[]>>(`/location/countries?page=${page}&perPage=${perPage}`)
  return response.data
}

export async function saveCountry(
  name: string,
  code: string | null,
  phoneCode: string | null,
  isActive: boolean,
  id?: number
): Promise<ApiResponse<Country>> {
  const body = {
    name,
    code,
    phone_code: phoneCode,
    is_active: isActive,
  }
  if (id) {
    const response = await apiClient.put<ApiResponse<Country>>(`/location/countries/${id}`, body)
    return response.data
  }
  const response = await apiClient.post<ApiResponse<Country>>("/location/countries", body)
  return response.data
}

export async function getCities(): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<City[]>>("/location/cities")
  return response.data.data
}

export async function getCitiesByCountry(countryId: number): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<City[]>>(`/location/cities?country_id=${countryId}`)
  return response.data.data
}

export async function saveCity(
  name: string,
  countryId: number,
  stateProvince: string | null,
  postalCode: string | null,
  isActive: boolean,
  id?: number
): Promise<ApiResponse<City>> {
  const body = {
    name,
    country_id: countryId,
    state_provianc: stateProvince,
    postal_code: postalCode,
    is_active: isActive,
  }
  if (id) {
    const response = await apiClient.put<ApiResponse<City>>(`/location/cities/${id}`, body)
    return response.data
  }
  const response = await apiClient.post<ApiResponse<City>>("/location/cities", body)
  return response.data
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", { email, password })
  return response.data
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  })
  return response.data
}