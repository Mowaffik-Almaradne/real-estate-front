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
  /**
 * List viewings from the agent/publisher dashboard
 * (incoming viewing requests on the agent's properties).
 */
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

  /**
   * List viewings booked by the current user (as a buyer/renter).
   */
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

  /**
   * Fetch the upcoming schedule view for the agent dashboard calendar widget.
   */
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

  /**
 * Fetch viewings formatted as calendar events between two ISO dates.
 */
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

  /**
 * Fetch a single viewing by ID.
 */
async getById(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.get<ApiResponse<PropertyViewingDto>>(`/dashboard/viewings/${id}`)
    return getApiData(response)
  },

  /**
   * Book a new viewing for a property.
   * Throws `ApiClientError` with status 409 if the slot conflicts — see `isSlotConflict`.
   */
  async create(request: CreateViewingRequest): Promise<PropertyViewingDto> {
    const response = await apiClient.post<ApiResponse<PropertyViewingDto>>(
      "/dashboard/viewings",
      request
    )
    return getApiData(response)
  },

  /**
   * Move a viewing to a new scheduled time (publisher or requester action).
   */
  async reschedule(id: number, request: RescheduleViewingRequest): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/reschedule`,
      request
    )
    return getApiData(response)
  },

  /**
   * Confirm a pending viewing request (publisher action).
   */
  async confirm(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/confirm`
    )
    return getApiData(response)
  },

  /**
   * Cancel a viewing. Optional reason is forwarded to the backend.
   */
  async cancel(id: number, request: CancelViewingRequest = {}): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/cancel`,
      request
    )
    return getApiData(response)
  },

  /**
   * Mark a viewing as completed (publisher action, post-viewing).
   */
  async complete(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/complete`
    )
    return getApiData(response)
  },

  /**
   * Mark that the requester did not attend a confirmed viewing.
   */
  async markNoShow(id: number): Promise<PropertyViewingDto> {
    const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
      `/dashboard/viewings/${id}/no-show`
    )
    return getApiData(response)
  },

  /**
   * Permanently delete a viewing record.
   */
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
