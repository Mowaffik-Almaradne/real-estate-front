import {
  apiClient,
  getApiData,
  type ApiResponse,
  ApiClientError,
} from "@/lib/apiClient"
import type {
  AiDescriptionGenerateRequest,
  AiDescriptionGenerateResponse,
  AiDescriptionImproveRequest,
  AiDescriptionImproveResponse,
  AiDescriptionSuggestFeaturesRequest,
  AiDescriptionSuggestFeaturesResponse,
  AiDescriptionSuggestTitleRequest,
  AiDescriptionSuggestTitleResponse,
  AiSearchRequest,
  AiSearchResponse,
  AiSearchResultItem,
} from "../types/dto"

export { ApiClientError as AiServiceError }

function isAccessError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.isForbidden() || error.isNotFound() || error.isUnauthorized())
  )
}

function isRateLimited(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) return false
  if (error.status === 429) return true
  return /throttled|rate limit|too many/i.test(error.message)
}

function pickList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data
  }
  return []
}

function firstList<T>(value: Record<string, unknown>, keys: string[]): T[] {
  for (const key of keys) {
    const list = pickList<T>(value[key])
    if (list.length > 0) return list
  }
  return []
}

function normalizeSearch(payload: unknown, query: string): AiSearchResponse {
  if (payload == null) {
    return { query, results: [] }
  }
  if (Array.isArray(payload)) {
    return {
      query,
      results: payload as AiSearchResultItem[],
      total: payload.length,
    }
  }
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    const results = firstList<AiSearchResultItem>(obj, [
      "results",
      "data",
      "matches",
      "items",
    ])
    const total =
      typeof obj.total === "number"
        ? obj.total
        : typeof obj.count === "number"
          ? obj.count
          : results.length
    return {
      query,
      results,
      total,
      extras: Object.fromEntries(
        Object.entries(obj).filter(
          ([key]) =>
            !["results", "data", "matches", "items", "total", "count", "query"].includes(key)
        )
      ),
    }
  }
  return { query, results: [] }
}

function normalizeTextList(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string") {
          return (item as { text: string }).text
        }
        return ""
      })
      .filter((value) => value.length > 0)
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.titles)) return normalizeTextList(obj.titles)
    if (Array.isArray(obj.features)) return normalizeTextList(obj.features)
    if (Array.isArray(obj.suggestions)) return normalizeTextList(obj.suggestions)
    if (Array.isArray(obj.alternatives)) return normalizeTextList(obj.alternatives)
  }
  return []
}

function normalizeSingleText(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    if (typeof obj.description === "string") return obj.description
    if (typeof obj.text === "string") return obj.text
    if (typeof obj.improved_description === "string") return obj.improved_description
  }
  return ""
}

export const aiService = {
  async search(input: AiSearchRequest): Promise<AiSearchResponse> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/ai/search",
      { query: input.query }
    )
    const data = getApiData(response)
    return normalizeSearch(data, input.query)
  },

  async generateDescription(
    input: AiDescriptionGenerateRequest = {}
  ): Promise<AiDescriptionGenerateResponse> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/ai/description/generate",
      input.language ? { language: input.language } : {}
    )
    const data = getApiData(response)
    const description = normalizeSingleText(data)
    const alternatives = normalizeTextList(
      (data as { alternatives?: unknown } | null)?.alternatives
    )
    const language = (data as { language?: string } | null)?.language
    return {
      description,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      language: language === "ar" || language === "en" ? language : input.language,
    }
  },

  async improveDescription(
    input: AiDescriptionImproveRequest & { description: string }
  ): Promise<AiDescriptionImproveResponse> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/ai/description/improve",
      input.language ? { language: input.language } : {}
    )
    const data = getApiData(response)
    const improved = normalizeSingleText(data) || input.description
    const notes = normalizeTextList(
      (data as { notes?: unknown } | null)?.notes
    )
    const language = (data as { language?: string } | null)?.language
    return {
      improved_description: improved,
      notes: notes.length > 0 ? notes : undefined,
      language: language === "ar" || language === "en" ? language : input.language,
    }
  },

  async suggestTitles(
    input: AiDescriptionSuggestTitleRequest = {}
  ): Promise<AiDescriptionSuggestTitleResponse> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/ai/description/suggest-title",
      input.language ? { language: input.language } : {}
    )
    const data = getApiData(response)
    const titles = normalizeTextList(data)
    const language = (data as { language?: string } | null)?.language
    return {
      titles,
      language: language === "ar" || language === "en" ? language : input.language,
    }
  },

  async suggestFeatures(
    input: AiDescriptionSuggestFeaturesRequest
  ): Promise<AiDescriptionSuggestFeaturesResponse> {
    const payload: Record<string, string> = { property_type: input.property_type }
    if (input.language) payload.language = input.language
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/ai/description/suggest-features",
      payload
    )
    const data = getApiData(response)
    const features = normalizeTextList(data)
    const language = (data as { language?: string } | null)?.language
    return {
      features,
      language: language === "ar" || language === "en" ? language : input.language,
    }
  },
}

export function isAiAccessError(error: unknown): boolean {
  return isAccessError(error)
}

export function isAiRateLimited(error: unknown): boolean {
  return isRateLimited(error)
}
