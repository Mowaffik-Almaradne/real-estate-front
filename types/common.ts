export type ID = number | string

export interface Timestamps {
  created_at: string
  updated_at?: string
}

export interface ApiPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export type PaginationInfo = ApiPagination

export interface Media {
  id: number
  url: string
  thumb_url?: string | null
  original_url?: string
  mime_type?: string
  size?: number
  name?: string
}

export interface Address {
  country_id: number | null
  city_id: number | null
  state_province?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface Money {
  amount: number
  currency: string
  formatted?: string
}

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}
