import {
  apiClient,
  getApiData,
  getApiPagination,
  type ApiResponse,
  ApiClientError,
} from "@/lib/apiClient"
import type { AxiosResponse } from "axios"
import type {
  CreateRentalCardInput,
  EndRentalCardInput,
  RenewRentalCardInput,
  RentalCardDto,
  RentalCardFilters,
  RentalCardHistoryResponse,
  RentalCardListResponse,
  UpdateRentalCardInput,
} from "../types/dto"

export { ApiClientError as RentalCardServiceError }

const EMPTY_PAGINATION = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null as number | null,
  to: null as number | null,
}

function buildParams(filters: RentalCardFilters = {}): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.property_id) params.property_id = filters.property_id
  if (filters.owner_id) params.owner_id = filters.owner_id
  if (filters.tenant_user_id) params.tenant_user_id = filters.tenant_user_id
  if (typeof filters.is_renewable === "boolean") params.is_renewable = filters.is_renewable
  if (filters.start_date) params.start_date = filters.start_date
  if (filters.end_date) params.end_date = filters.end_date
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

function unwrapList(response: AxiosResponse<unknown>): RentalCardListResponse {
  const data = getApiData<RentalCardDto[]>(response as AxiosResponse<ApiResponse<RentalCardDto[]> | RentalCardDto[]>)
  const list = Array.isArray(data) ? data : []
  return {
    data: list,
    pagination:
      getApiPagination(response as AxiosResponse<ApiResponse<RentalCardDto[]>>) ?? { ...EMPTY_PAGINATION },
  }
}

function buildCreateFormData(input: CreateRentalCardInput): FormData {
  const form = new FormData()
  form.append("property_id", String(input.property_id))
  if (input.tenant_user_id != null) {
    form.append("tenant_user_id", String(input.tenant_user_id))
  }
  if (input.external_tenant_name) {
    form.append("external_tenant_name", input.external_tenant_name)
  }
  if (input.external_tenant_phone) {
    form.append("external_tenant_phone", input.external_tenant_phone)
  }
  if (input.external_tenant_email) {
    form.append("external_tenant_email", input.external_tenant_email)
  }
  if (input.external_tenant_id_notes) {
    form.append("external_tenant_id_notes", input.external_tenant_id_notes)
  }
  form.append("start_date", input.start_date)
  form.append("end_date", input.end_date)
  if (input.terms) form.append("terms", input.terms)
  if (input.notes) form.append("notes", input.notes)
  if (typeof input.is_renewable === "boolean") {
    form.append("is_renewable", input.is_renewable ? "1" : "0")
  }
  if (input.pre_rental_photos && input.pre_rental_photos.length > 0) {
    input.pre_rental_photos.forEach((file) => {
      form.append("pre_rental_photos[]", file)
    })
  }
  return form
}

export const rentalCardService = {
  async list(filters: RentalCardFilters = {}): Promise<RentalCardListResponse> {
    const response = await apiClient.get<ApiResponse<RentalCardDto[]>>(
      "/dashboard/rental-cards",
      { params: buildParams(filters), silent: true }
    )
    return unwrapList(response)
  },

  async getById(id: number): Promise<RentalCardDto> {
    const response = await apiClient.get<ApiResponse<RentalCardDto>>(
      `/dashboard/rental-cards/${id}`,
      { silent: true }
    )
    return getApiData(response)
  },

  async getActiveForProperty(propertyId: number): Promise<RentalCardDto | null> {
    const response = await apiClient.get<ApiResponse<RentalCardDto | RentalCardDto[]>>(
      `/dashboard/properties/${propertyId}/rental-cards/active`,
      { silent: true }
    )
    const data = getApiData(response)
    if (Array.isArray(data)) return data[0] ?? null
    return (data as RentalCardDto | null) ?? null
  },

  async getHistoryForProperty(
    propertyId: number,
    filters: RentalCardFilters = {}
  ): Promise<RentalCardHistoryResponse> {
    const response = await apiClient.get<ApiResponse<RentalCardDto[]>>(
      `/dashboard/properties/${propertyId}/rental-cards/history`,
      { params: buildParams(filters), silent: true }
    )
    const unwrapped = unwrapList(response)
    return {
      data: unwrapped.data,
      pagination: unwrapped.pagination,
    }
  },

  async create(input: CreateRentalCardInput): Promise<RentalCardDto> {
    const hasFiles = Boolean(input.pre_rental_photos && input.pre_rental_photos.length > 0)
    if (hasFiles) {
      const form = buildCreateFormData(input)
      const response = await apiClient.post<ApiResponse<RentalCardDto>>(
        "/dashboard/rental-cards",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      return getApiData(response)
    }
    const json: Record<string, unknown> = {
      property_id: input.property_id,
      start_date: input.start_date,
      end_date: input.end_date,
    }
    if (input.tenant_user_id != null) json.tenant_user_id = input.tenant_user_id
    if (input.external_tenant_name) json.external_tenant_name = input.external_tenant_name
    if (input.external_tenant_phone) json.external_tenant_phone = input.external_tenant_phone
    if (input.external_tenant_email) json.external_tenant_email = input.external_tenant_email
    if (input.external_tenant_id_notes)
      json.external_tenant_id_notes = input.external_tenant_id_notes
    if (input.terms) json.terms = input.terms
    if (input.notes) json.notes = input.notes
    if (typeof input.is_renewable === "boolean") json.is_renewable = input.is_renewable
    const response = await apiClient.post<ApiResponse<RentalCardDto>>(
      "/dashboard/rental-cards",
      json
    )
    return getApiData(response)
  },

  async update(id: number, input: UpdateRentalCardInput): Promise<RentalCardDto> {
    const json: Record<string, unknown> = {}
    if (input.end_date) json.end_date = input.end_date
    if (input.terms !== undefined) json.terms = input.terms
    if (input.notes !== undefined) json.notes = input.notes
    if (typeof input.is_renewable === "boolean") json.is_renewable = input.is_renewable
    const response = await apiClient.patch<ApiResponse<RentalCardDto>>(
      `/dashboard/rental-cards/${id}`,
      json
    )
    return getApiData(response)
  },

  async end(id: number, input: EndRentalCardInput = {}): Promise<RentalCardDto> {
    const json: Record<string, unknown> = {}
    if (input.ended_at) json.ended_at = input.ended_at
    if (input.end_reason) json.end_reason = input.end_reason
    const response = await apiClient.patch<ApiResponse<RentalCardDto>>(
      `/dashboard/rental-cards/${id}/end`,
      json
    )
    return getApiData(response)
  },

  async renew(id: number, input: RenewRentalCardInput): Promise<RentalCardDto> {
    const json: Record<string, unknown> = { end_date: input.end_date }
    if (input.terms) json.terms = input.terms
    if (input.notes) json.notes = input.notes
    const response = await apiClient.patch<ApiResponse<RentalCardDto>>(
      `/dashboard/rental-cards/${id}/renew`,
      json
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/rental-cards/${id}`)
  },
}

export function isRentalCardAccessError(error: unknown): boolean {
  return isAccessError(error)
}
