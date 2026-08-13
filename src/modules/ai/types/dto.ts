import type { Timestamps } from "@/types/common"
import type { AiDescriptionLanguage } from "./enums"

export interface AiSearchRequest {
  query: string
}

export interface AiSearchResultItem {
  id: number | string
  title?: string | null
  description?: string | null
  score?: number | string | null
  url?: string | null
  property_id?: number | string | null
  city?: string | null
  property_type?: string | null
  price?: number | string | null
  currency?: string | null
  thumbnail?: string | null
  matched_features?: string[]
  [key: string]: unknown
}

export interface AiSearchResponse {
  query: string
  results: AiSearchResultItem[]
  total?: number
  extras?: Record<string, unknown>
}

export interface AiDescriptionGenerateRequest {
  language?: AiDescriptionLanguage
}

export interface AiDescriptionImproveRequest {
  language?: AiDescriptionLanguage
}

export interface AiDescriptionSuggestTitleRequest {
  language?: AiDescriptionLanguage
}

export interface AiDescriptionSuggestFeaturesRequest {
  property_type: string
  language?: AiDescriptionLanguage
}

export interface AiTextSuggestionDto {
  text: string
  score?: number | null
}

export interface AiDescriptionGenerateResponse {
  description: string
  alternatives?: string[]
  language?: AiDescriptionLanguage
}

export interface AiDescriptionImproveResponse {
  improved_description: string
  language?: AiDescriptionLanguage
  notes?: string[]
}

export interface AiDescriptionSuggestTitleResponse {
  titles: string[]
  language?: AiDescriptionLanguage
}

export interface AiDescriptionSuggestFeaturesResponse {
  features: string[]
  language?: AiDescriptionLanguage
}

export interface AiCallLog extends Timestamps {
  id?: number | string
  endpoint: string
  request: Record<string, unknown>
  response: unknown
  language?: AiDescriptionLanguage
}
