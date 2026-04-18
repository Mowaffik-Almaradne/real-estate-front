export type PropertyStatus = "pending" | "approved" | "rejected" | "suspended" | "sold" | "archived"

export type PropertyType = "apartment" | "house" | "villa" | "land" | "commercial"

export type TypeOfContract = "rent" | "sale"

export interface Property {
  id: number
  name: string
  description: string
  country: { id: number; name: string }
  city: { id: number; name: string }
  longitude?: number
  latitude?: number
  property_type: PropertyType
  type_of_contract: TypeOfContract
  rooms: number
  bathrooms: number
  area: string
  detailed_info?: string
  price: string
  currency: string
  formatted_price: string
  status: PropertyStatus
  main_image: string
  main_image_thumb: string
  gallery: { id: number; url: string; url_thumb: string }[]
  publisher: { id: number; name: string; email: string }
  created_at: string
  updated_at?: string
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
  main_image?: {
    id?: number
    temporary_folder?: string
  }
  gallery?: {
    id?: number
    temporary_folder?: string
  }[]
}

export interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface PropertyStatistics {
  pending: number
  approved: number
  rejected: number
  suspended: number
  sold: number
  archived: number
  all: number
}

export interface PropertyFilters {
  search?: string
  status?: PropertyStatus
  property_type?: PropertyType
  type_of_contract?: TypeOfContract
  rooms?: string
  bathrooms?: string
  page?: number
  per_page?: number
}