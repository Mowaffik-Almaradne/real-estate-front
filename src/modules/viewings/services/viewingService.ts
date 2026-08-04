import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import { ApiClientError } from "@/lib/apiClient"
import type {
  CalendarViewingEvent,
  CancelViewingRequest,
  CreateViewingRequest,
  PropertyViewingDto,
  RescheduleViewingRequest,
  ViewingFilters,
  ViewingsResponse,
} from "@/types/dto"
import { ViewingStatus } from "@/types/enums"

export { ApiClientError as ViewingServiceError }

function buildParams(filters: ViewingFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.property_id) params.property_id = filters.property_id
  if (filters.scheduled_at) params.scheduled_at = filters.scheduled_at
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  return params
}

export const viewingService = {
  async list(filters: ViewingFilters = {}): Promise<ViewingsResponse> {
    const response = await apiClient.get<ApiResponse<PropertyViewingDto[]>>("/dashboard/viewings", {
      params: buildParams(filters),
    })
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
      },
    }
  },

  async listMine(filters: ViewingFilters = {}): Promise<ViewingsResponse> {
    const response = await apiClient.get<ApiResponse<PropertyViewingDto[]>>(
      "/dashboard/viewings/my",
      { params: buildParams(filters) }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
      },
    }
  },

  async getSchedule(filters: ViewingFilters = {}): Promise<ViewingsResponse> {
    const response = await apiClient.get<ApiResponse<PropertyViewingDto[]>>(
      "/dashboard/viewings/schedule",
      { params: buildParams(filters) }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      pagination: pagination ?? {
        total: 0,
        per_page: 0,
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
      },
    }
  },

  async getCalendar(from?: string, to?: string): Promise<CalendarViewingEvent[]> {
    const params: Record<string, string> = {}
    if (from) params.from = from
    if (to) params.to = to
    const response = await apiClient.get<ApiResponse<CalendarViewingEvent[]>>(
      "/dashboard/viewings/calendar",
      { params }
    )
    return getApiData(response)
  },

  async getById(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.get<ApiResponse<PropertyViewingDto>>(`/dashboard/viewings/${id}`)
    return getApiData(response)
  },

  async create(request: CreateViewingRequest): Promise<PropertyViewingDto> {
    const response = await apiClient.post<ApiResponse<PropertyViewingDto>>(
      "/dashboard/viewings",
      request
    )
    return getApiData(response)
  },

  async reschedule(id: number, request: RescheduleViewingRequest): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/reschedule`,
      request
    )
    return getApiData(response)
  },

  async confirm(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/confirm`
    )
    return getApiData(response)
  },

  async cancel(id: number, request: CancelViewingRequest = {}): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/cancel`,
      request
    )
    return getApiData(response)
  },

  async complete(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/complete`
    )
    return getApiData(response)
  },

  async markNoShow(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/no-show`
    )
    return getApiData(response)
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/viewings/${id}`)
  },
}

export function isSlotConflict(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) return false
  if (error.status === 409) return true
  const message = error.message.toLowerCase()
  return (
    message.includes("unavailable") ||
    message.includes("conflict") ||
    message.includes("not available") ||
    message.includes("already booked") ||
    message.includes("overlap")
  )
}

export function getStatusAfterAction(
  current: ViewingStatus,
  action: "confirm" | "cancel" | "complete" | "no_show" | "reschedule"
): ViewingStatus | null {
  const transitions: Record<typeof action, { from: readonly ViewingStatus[]; to: ViewingStatus }> = {
    confirm: { from: [ViewingStatus.pending, ViewingStatus.rescheduled], to: ViewingStatus.confirmed },
    cancel: {
      from: [ViewingStatus.pending, ViewingStatus.confirmed, ViewingStatus.rescheduled],
      to: ViewingStatus.cancelled,
    },
    complete: { from: [ViewingStatus.confirmed, ViewingStatus.rescheduled], to: ViewingStatus.completed },
    no_show: { from: [ViewingStatus.confirmed, ViewingStatus.rescheduled], to: ViewingStatus.no_show },
    reschedule: { from: [ViewingStatus.pending, ViewingStatus.confirmed], to: ViewingStatus.rescheduled },
  }
  const rule = transitions[action]
  return rule.from.includes(current) ? rule.to : null
}
