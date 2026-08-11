import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"
import type { PropertyDto } from "@/types/dto"
import type {
  PublisherProfileDto,
  PublisherPropertyFilters,
  PublisherPropertiesResponse,
} from "@/types/publisher"

export const userService = {
  async getById(id: number): Promise<PublisherProfileDto> {
    const response = await apiClient.get<ApiResponse<PublisherProfileDto>>(`/users/${id}`)
    return getApiData(response)
  },

  async getProperties(
    id: number,
    filters: PublisherPropertyFilters = {}
  ): Promise<PublisherPropertiesResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append("page", String(filters.page))
    if (filters.perPage) params.append("perPage", String(filters.perPage))
    if (filters.sort_by) params.append("sort_by", filters.sort_by)
    if (filters.sort_order) params.append("sort_order", filters.sort_order)

    const response = await apiClient.get<ApiResponse<PropertyDto[]>>(
      `/users/${id}/properties`,
      { params: Object.fromEntries(params) }
    )
    const pagination: ApiPagination = getApiPagination(response) ?? {
      total: 0,
      per_page: 0,
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
    }
    return { data: getApiData(response), pagination }
  },
}