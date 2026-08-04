import type { ApiPagination, Timestamps } from "./common"
import { PropertyStatus, PropertyType, TypeOfContract } from "@/types/enums"

export interface CountryDto extends Timestamps {
  id: number
  name: string
  code: string | null
  phone_code: string | null
  is_active: boolean
  cities_count?: number
}

export interface CityDto extends Timestamps {
  id: number
  name: string
  country_id: number | null
  state_province: string | null
  postal_code: string | null
  is_active: boolean
  country?: Pick<CountryDto, "id" | "name">
}

export interface CountryFormData {
  name: string
  code: string | null
  phone_code: string | null
  is_active: boolean
}

export interface CityFormData {
  name: string
  country_id: number
  state_province: string | null
  postal_code: string | null
  is_active: boolean
}

export interface CityFilters {
  search?: string
  page?: number
  per_page?: number
  perPage?: number
}

export interface CitiesResponse {
  data: CityDto[]
  pagination: ApiPagination
}

export interface PropertyFilters {
  search?: string
  status?: PropertyStatus
  property_type?: PropertyType
  type_of_contract?: TypeOfContract
  country_id?: number
  city_id?: number
  rooms?: number
  bathrooms?: number
  min_price?: number
  max_price?: number
  page?: number
  per_page?: number
  perPage?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface PropertyAddress {
  country: { id: number; name: string }
  city: { id: number; name: string }
  state_province?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface PropertyGalleryItem {
  id: number
  url: string
  thumb_url?: string
  url_thumb?: string
}

export interface PropertyPublisher {
  id: number
  name: string
  email?: string
  avatar_url?: string | null
  is_verified?: boolean
  average_rating?: number | null
  reviews_count?: number
  publisher_type?: "individual" | "office" | null
}

export interface PropertyDto extends Timestamps {
  id: number
  name: string
  description: string
  property_type: PropertyType
  type_of_contract: TypeOfContract
  status: PropertyStatus
  rooms: number
  bathrooms: number
  area: number | string
  detailed_info?: string | null
  price: number | string
  currency: string
  formatted_price: string
  country: { id: number; name: string }
  city: { id: number; name: string }
  state_province?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  main_image: string | null
  main_image_thumb?: string | null
  gallery: PropertyGalleryItem[]
  publisher: PropertyPublisher
  is_favorited?: boolean
  favorites_count?: number
  views_count?: number
  rejection_reason?: string | null
}

export interface PropertyFormData {
  name: string
  description: string
  country_id: number
  city_id: number
  longitude?: number
  latitude?: number
  property_type: PropertyType
  type_of_contract: TypeOfContract
  rooms: number
  bathrooms: number
  area: number
  detailed_info?: string
  price: number
  currency?: string
  main_image?: { id?: number; temporary_folder?: string }
  gallery?: { id?: number; temporary_folder?: string }[]
}

export interface PropertyStatisticsDto {
  draft: number
  pending: number
  under_inspection: number
  approved: number
  rejected: number
  suspended: number
  sold: number
  archived: number
  all: number
}

export interface FavoriteToggleResponse {
  favorited: boolean
  favorites_count: number
}
