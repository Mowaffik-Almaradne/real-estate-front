import { apiClient, getApiData, ApiClientError } from "@/lib/apiClient"
import type {
  CreateSavedSearchRequest,
  SavedSearch,
  UpdateSavedSearchRequest,
} from "../types"

export { ApiClientError as SavedSearchServiceError }

type MaybeWrapped<T> = T | { data: T }

function unwrap<T>(value: T | { data: T }): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }
  return value
}

export const savedSearchService = {
  async list(): Promise<SavedSearch[]> {
    const response = await apiClient.get<MaybeWrapped<SavedSearch[]> | SavedSearch[]>(
      "/saved-searches"
    )
    const data = getApiData(response) as MaybeWrapped<SavedSearch[]> | SavedSearch[] | null
    if (!data) return []
    return [...unwrap(data)]
  },

  async create(request: CreateSavedSearchRequest): Promise<SavedSearch> {
    const response = await apiClient.post<MaybeWrapped<SavedSearch>>(
      "/saved-searches",
      request
    )
    return unwrap(getApiData(response))
  },

  async update(id: number, request: UpdateSavedSearchRequest): Promise<SavedSearch> {
    const response = await apiClient.patch<MaybeWrapped<SavedSearch>>(
      `/saved-searches/${id}`,
      request
    )
    return unwrap(getApiData(response))
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/saved-searches/${id}`)
  },
}