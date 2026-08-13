import {
  apiClient,
  getApiData,
  getApiPagination,
  type ApiResponse,
  ApiClientError,
} from "@/lib/apiClient"
import type { AxiosResponse } from "axios"
import type {
  CancelDepositInput,
  CreateDepositInput,
  DepositDto,
  DepositFilters,
  DepositListResponse,
  PayDepositInput,
  RefundDepositInput,
  ReleaseDepositInput,
  UpdateDepositInput,
} from "../types/dto"

export { ApiClientError as DepositServiceError }

const EMPTY_PAGINATION = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null as number | null,
  to: null as number | null,
}

function buildParams(filters: DepositFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.property_id) params.property_id = filters.property_id
  if (filters.buyer_id) params.buyer_id = filters.buyer_id
  if (filters.seller_id) params.seller_id = filters.seller_id
  if (filters.currency) params.currency = filters.currency
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_order) params.sort_order = filters.sort_order
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  return params
}

function isAccessError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.isForbidden() || error.isNotFound() || error.isUnauthorized())
  )
}

function unwrapList(response: AxiosResponse<unknown>): DepositListResponse {
  const data = getApiData<DepositDto[]>(
    response as AxiosResponse<ApiResponse<DepositDto[]> | DepositDto[]>
  )
  const list = Array.isArray(data) ? data : []
  return {
    data: list,
    pagination:
      getApiPagination(response as AxiosResponse<ApiResponse<DepositDto[]>>) ?? {
        ...EMPTY_PAGINATION,
      },
  }
}

export const depositService = {
  async listMine(filters: DepositFilters = {}): Promise<DepositListResponse> {
    const response = await apiClient.get<ApiResponse<DepositDto[]>>(
      "/dashboard/my-deposits",
      { params: buildParams(filters), silent: true }
    )
    return unwrapList(response)
  },

  async listSales(filters: DepositFilters = {}): Promise<DepositListResponse> {
    const response = await apiClient.get<ApiResponse<DepositDto[]>>(
      "/dashboard/my-sales",
      { params: buildParams(filters), silent: true }
    )
    return unwrapList(response)
  },

  async getById(id: number): Promise<DepositDto> {
    const response = await apiClient.get<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}`,
      { silent: true }
    )
    return getApiData(response)
  },

  async create(input: CreateDepositInput): Promise<DepositDto> {
    const payload: Record<string, unknown> = {
      property_id: input.property_id,
      seller_id: input.seller_id,
      amount: input.amount,
    }
    if (input.currency) payload.currency = input.currency
    if (input.terms !== undefined) payload.terms = input.terms
    if (input.notes !== undefined) payload.notes = input.notes
    const response = await apiClient.post<ApiResponse<DepositDto>>(
      "/dashboard/deposits",
      payload
    )
    return getApiData(response)
  },

  async update(id: number, input: UpdateDepositInput): Promise<DepositDto> {
    const payload: Record<string, unknown> = {}
    if (input.amount !== undefined) payload.amount = input.amount
    if (input.terms !== undefined) payload.terms = input.terms
    if (input.notes !== undefined) payload.notes = input.notes
    const response = await apiClient.patch<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/deposits/${id}`)
  },

  async pay(id: number, input: PayDepositInput): Promise<DepositDto> {
    const response = await apiClient.post<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}/pay`,
      { payment_method: input.payment_method }
    )
    return getApiData(response)
  },

  async release(id: number, input: ReleaseDepositInput = {}): Promise<DepositDto> {
    const payload: Record<string, unknown> = {}
    if (input.notes) payload.notes = input.notes
    const response = await apiClient.post<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}/release`,
      payload
    )
    return getApiData(response)
  },

  async refund(id: number, input: RefundDepositInput = {}): Promise<DepositDto> {
    const payload: Record<string, unknown> = {}
    if (input.notes) payload.notes = input.notes
    const response = await apiClient.post<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}/refund`,
      payload
    )
    return getApiData(response)
  },

  async cancel(id: number, input: CancelDepositInput): Promise<DepositDto> {
    const response = await apiClient.post<ApiResponse<DepositDto>>(
      `/dashboard/deposits/${id}/cancel`,
      { reason: input.reason }
    )
    return getApiData(response)
  },
}

export function isDepositAccessError(error: unknown): boolean {
  return isAccessError(error)
}
