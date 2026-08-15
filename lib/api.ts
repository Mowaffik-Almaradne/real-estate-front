import { apiClient, getApiData, type ApiResponse } from "./apiClient"
import { ContactPreference, PublisherType, UserStatus } from "@/types/enums"
import type { AuthSessionDto, CityDto, CountryDto } from "@/types/dto"

export { apiClient } from "./apiClient"
export type { ApiResponse }

export type User = import("@/types/dto").UserDto
export type AuthResponse = AuthSessionDto
export type Country = CountryDto
export type City = CityDto

type SearchItem = {
  id: number
  name: string
  country_id?: number | null
}

function normalizeCountry(item: SearchItem): Country {
  return {
    id: item.id,
    name: item.name,
    code: null,
    phone_code: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  }
}

function normalizeCity(item: SearchItem, countryId: number | null = null): City {
  return {
    id: item.id,
    name: item.name,
    country_id: item.country_id ?? countryId,
    state_province: null,
    postal_code: null,
    is_active: true,
    created_at: "",
    updated_at: "",
  }
}

/**
 * Public country lookup.
 * OpenAPI `/api/location/countries` requires auth on this backend (403).
 * Use `/api/search/countries` (documented as public `GET /api/search/{type}`).
 */
export async function getCountries(
  page: number = 1,
  perPage: number = 10
): Promise<ApiResponse<Country[]>> {
  const response = await apiClient.get<ApiResponse<SearchItem[]>>("/search/countries", {
    params: { page, perPage },
  })
  const items = getApiData(response) ?? []
  return {
    ...response.data,
    data: items.map(normalizeCountry),
  }
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

/**
 * Public city lookup via `/api/search/cities`.
 */
export async function getCities(): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<SearchItem[]>>("/search/cities")
  const items = getApiData(response) ?? []
  return items.map((item) => normalizeCity(item))
}

export async function getCitiesByCountry(countryId: number): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<SearchItem[]>>("/search/cities", {
    params: { country_id: countryId },
  })
  const items = getApiData(response) ?? []
  return items.map((item) => normalizeCity(item, countryId))
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
    state_province: stateProvince,
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

export async function login(identifier: string): Promise<ApiResponse<import("@/types/dto").OtpLoginResponse>> {
  const response = await apiClient.post<ApiResponse<import("@/types/dto").OtpLoginResponse>>(
    "/auth/login",
    { identifier }
  )
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

export type { ContactPreference, PublisherType, UserStatus }
