import { apiClient, getApiData, getApiPagination, ApiClientError, type ApiResponse } from "@/lib/apiClient"
import { withPropertyImagesList } from "@/lib/property-images"
import type { ApiPagination } from "@/types/common"
import type { PropertyDto } from "@/types/dto"
import { PublisherType } from "@/types/enums"
import type {
  PublisherProfileDto,
  PublisherPropertyFilters,
  PublisherPropertiesResponse,
} from "@/types/publisher"

function toPublisherProfile(
  id: number,
  partial: Partial<PublisherProfileDto> & { name?: string }
): PublisherProfileDto {
  return {
    id,
    name: partial.name ?? `Publisher #${id}`,
    email: partial.email ?? null,
    phone: partial.phone ?? null,
    avatar_url: partial.avatar_url ?? null,
    publisher_type: partial.publisher_type ?? PublisherType.individual,
    is_verified: Boolean(partial.is_verified),
    description: partial.description ?? null,
    website_url: partial.website_url ?? null,
    social_links: partial.social_links ?? null,
    average_rating: partial.average_rating ?? null,
    reviews_count: partial.reviews_count ?? 0,
    properties_count: partial.properties_count ?? 0,
    employees_count: partial.employees_count ?? null,
    created_at: partial.created_at ?? new Date().toISOString(),
  }
}

export const userService = {
  /**
   * Public publisher profile.
   * OpenAPI `/api/users/{id}` is admin-only (403 for normal users), so we
   * resolve via office profile / property browse / search instead.
   */
  async getById(id: number): Promise<PublisherProfileDto> {
    try {
      const response = await apiClient.get<ApiResponse<PublisherProfileDto>>(
        `/dashboard/publishers/offices/${id}`,
        { silent: true }
      )
      return toPublisherProfile(id, getApiData(response) ?? { id, name: `Publisher #${id}` })
    } catch {
      // continue
    }

    try {
      const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/properties/browse", {
        params: { publisher_id: id, perPage: 1 },
        silent: true,
      })
      const properties = getApiData(response) ?? []
      const publisher = properties[0]?.publisher
      if (publisher) {
        return toPublisherProfile(id, {
          id: publisher.id,
          name: publisher.name,
          is_verified: publisher.is_verified,
          publisher_type: publisher.publisher_type ?? PublisherType.individual,
          properties_count: getApiPagination(response)?.total ?? properties.length,
        })
      }
    } catch {
      // continue
    }

    try {
      const response = await apiClient.get<ApiResponse<Array<{ id: number; name: string }>>>(
        "/search/users",
        { params: { search: String(id) }, silent: true }
      )
      const match = (getApiData(response) ?? []).find((user) => user.id === id)
      if (match) {
        return toPublisherProfile(id, { name: match.name })
      }
    } catch {
      // continue
    }

    // Last resort: avoid hard-failing the public profile page for permission errors.
    return toPublisherProfile(id, { name: `Publisher #${id}` })
  },

  async getProperties(
    id: number,
    filters: PublisherPropertyFilters = {}
  ): Promise<PublisherPropertiesResponse> {
    const params: Record<string, string> = {
      publisher_id: String(id),
    }
    if (filters.page) params.page = String(filters.page)
    if (filters.perPage) params.perPage = String(filters.perPage)
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order

    try {
      const response = await apiClient.get<ApiResponse<PropertyDto[]>>(
        `/users/${id}/properties`,
        { params, silent: true }
      )
      const pagination: ApiPagination = getApiPagination(response) ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      }
      return { data: withPropertyImagesList(getApiData(response)), pagination }
    } catch (error) {
      if (!(error instanceof ApiClientError) || (!error.isForbidden() && !error.isNotFound())) {
        throw error
      }
    }

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>("/properties/browse", {
      params,
    })
    const pagination: ApiPagination = getApiPagination(response) ?? {
      total: 0,
      per_page: 0,
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
    }
    return { data: withPropertyImagesList(getApiData(response)), pagination }
  },
}
