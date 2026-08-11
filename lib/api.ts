import { apiClient, type ApiResponse } from "./apiClient"
import { ContactPreference, PublisherType, UserStatus } from "@/types/enums"
import type { AuthSessionDto, CityDto, CountryDto } from "@/types/dto"

export { apiClient } from "./apiClient"
export type { ApiResponse }

export type User = import("@/types/dto").UserDto
export type AuthResponse = AuthSessionDto
export type Country = CountryDto
export type City = CityDto

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
