import {
  apiClient,
  ApiClientError,
  getApiData,
  getApiPagination,
  type ApiResponse,
  type ApiPagination,
} from "@/lib/apiClient"
import type {
  Appointment,
  AppointmentCalendarEvent,
  AppointmentFilters,
  AppointmentsResponse,
  CreateAppointmentRequest,
  CreateFollowUpRequest,
  UpdateAppointmentStatusRequest,
} from "../types"

export { ApiClientError as AppointmentsServiceError }

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

function emptyAppointments(data: Appointment[] = []): AppointmentsResponse {
  return {
    data,
    pagination: { ...EMPTY_PAGINATION, total: data.length, to: data.length },
  }
}

function buildParams(filters: AppointmentFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.type) params.type = filters.type
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.perPage = filters.perPage
  return params
}

export const appointmentService = {
  /**
   * OpenAPI: GET /api/dashboard/appointments
   * Optional filters: status, type, from, to, page, perPage.
   */
  async list(filters: AppointmentFilters = {}): Promise<AppointmentsResponse> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      "/dashboard/appointments",
      { params: buildParams(filters), silent: true }
    )
    const data = getApiData(response)
    return {
      data: Array.isArray(data) ? data : [],
      pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
    }
  },

  /**
   * OpenAPI: GET /api/dashboard/appointments/my
   * Personal queue: appointments where the current user is the requester.
   */
  async listMine(filters: AppointmentFilters = {}): Promise<AppointmentsResponse> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      "/dashboard/appointments/my",
      { params: buildParams(filters), silent: true }
    )
    const data = getApiData(response)
    return {
      data: Array.isArray(data) ? data : [],
      pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
    }
  },

  /**
   * OpenAPI: GET /api/dashboard/appointments/calendar?from&to
   */
  async getCalendar(from?: string, to?: string): Promise<AppointmentCalendarEvent[]> {
    const params: Record<string, string> = {}
    if (from) params.from = from
    if (to) params.to = to
    const response = await apiClient.get<ApiResponse<AppointmentCalendarEvent[]>>(
      "/dashboard/appointments/calendar",
      { params, silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  /**
   * OpenAPI: GET /api/dashboard/appointments/schedule
   * Returns the agent's weekly schedule.
   */
  async getSchedule(): Promise<Appointment[]> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      "/dashboard/appointments/schedule",
      { silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  /**
   * OpenAPI: POST /api/dashboard/appointments
   */
  async create(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      "/dashboard/appointments",
      request
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: POST /api/dashboard/appointments/follow-ups
   * Morphed to a followable entity (Lead, Property, ...).
   */
  async createFollowUp(request: CreateFollowUpRequest): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      "/dashboard/appointments/follow-ups",
      request
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: PATCH /api/dashboard/appointments/{id}/confirm
   */
  async confirm(id: number): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/dashboard/appointments/${id}/confirm`
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: PATCH /api/dashboard/appointments/{id}/reschedule
   * Required: status, scheduled_at when status=rescheduled.
   */
  async reschedule(
    id: number,
    request: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/dashboard/appointments/${id}/reschedule`,
      request
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: PATCH /api/dashboard/appointments/{id}/cancel
   * Required: status=cancelled, cancellation_reason.
   */
  async cancel(
    id: number,
    request: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/dashboard/appointments/${id}/cancel`,
      request
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: PATCH /api/dashboard/appointments/{id}/complete
   */
  async complete(id: number): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/dashboard/appointments/${id}/complete`
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: PATCH /api/dashboard/appointments/{id}/no-show
   */
  async markNoShow(id: number): Promise<Appointment> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/dashboard/appointments/${id}/no-show`
    )
    return getApiData(response)
  },

  /**
   * OpenAPI: DELETE /api/dashboard/appointments/{id}
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/dashboard/appointments/${id}`)
  },
}

export { emptyAppointments }
