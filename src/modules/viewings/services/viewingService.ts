import { apiClient, getApiData, getApiPagination, type ApiResponse } from "@/lib/apiClient"
import { ApiClientError } from "@/lib/apiClient"
import { getStoredUser } from "@/lib/auth"
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
import {
  canListViewingsFromApi,
  createLocalViewing,
  listLocalCalendarEvents,
  listLocalViewings,
  markViewingsApiDenied,
  mergeViewingsWithLocal,
  upsertLocalViewing,
} from "../localViewings"

export { ApiClientError as ViewingServiceError }

const EMPTY_PAGINATION = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null as number | null,
  to: null as number | null,
}

function emptyViewings(data: PropertyViewingDto[] = []): ViewingsResponse {
  return {
    data,
    pagination: {
      ...EMPTY_PAGINATION,
      total: data.length,
      to: data.length,
    },
  }
}

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

function isAccessError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.isForbidden() || error.isNotFound() || error.isUnauthorized())
  )
}

async function fetchViewings(
  url: string,
  filters: ViewingFilters = {},
  silent = false
): Promise<ViewingsResponse> {
  const response = await apiClient.get<ApiResponse<PropertyViewingDto[]>>(url, {
    params: buildParams(filters),
    silent,
  })
  const data = getApiData(response)
  return {
    data: Array.isArray(data) ? data : [],
    pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
  }
}

export type ListMineResult = ViewingsResponse & {
  /**
   * True when API list was skipped/denied because the role lacks viewings.list
   * (OpenAPI dashboard viewings require that permission → 403).
   */
  readonly denied: boolean
  readonly source: "viewings" | "viewings/my" | "appointments/my" | "local" | "none"
}

export const viewingService = {
  /**
   * OpenAPI: GET /api/dashboard/viewings
   * Requires permission `viewings.list` — returns 403 without it.
   */
  async list(filters: ViewingFilters = {}): Promise<ViewingsResponse> {
    const user = getStoredUser()
    if (!canListViewingsFromApi(user)) {
      return emptyViewings(listLocalViewings(filters.status))
    }
    try {
      const remote = await fetchViewings("/dashboard/viewings", filters, true)
      return {
        ...remote,
        data: mergeViewingsWithLocal(remote.data, filters.status),
      }
    } catch (error) {
      if (isAccessError(error)) {
        try {
          const remote = await fetchViewings("/dashboard/appointments", filters, true)
          return {
            ...remote,
            data: mergeViewingsWithLocal(remote.data, filters.status),
          }
        } catch (nested) {
          if (isAccessError(nested)) {
            return emptyViewings(listLocalViewings(filters.status))
          }
          throw nested
        }
      }
      throw error
    }
  },

  /**
   * Dashboard "My Viewings".
   *
   * Why 403 happens (OpenAPI + permissions-reference):
   * GET /api/dashboard/viewings[/my] requires permission `viewings.list`.
   * Accounts without that permission always get 403 from this backend.
   *
   * Strategy: skip forbidden API calls when permission is missing; show local bookings.
   */
  async listMine(filters: ViewingFilters = {}): Promise<ListMineResult> {
    const user = getStoredUser()
    if (!canListViewingsFromApi(user)) {
      const local = listLocalViewings(filters.status)
      return {
        ...emptyViewings(local),
        denied: true,
        source: local.length ? "local" : "none",
      }
    }

    try {
      const result = await fetchViewings("/dashboard/viewings", filters, true)
      return {
        ...result,
        data: mergeViewingsWithLocal(result.data, filters.status),
        denied: false,
        source: "viewings",
      }
    } catch (error) {
      if (!isAccessError(error)) throw error
      if (error instanceof ApiClientError && error.isForbidden()) {
        markViewingsApiDenied()
      }
    }

    try {
      const result = await fetchViewings("/dashboard/viewings/my", filters, true)
      return {
        ...result,
        data: mergeViewingsWithLocal(result.data, filters.status),
        denied: false,
        source: "viewings/my",
      }
    } catch (error) {
      if (!isAccessError(error)) throw error
      if (error instanceof ApiClientError && error.isForbidden()) {
        markViewingsApiDenied()
      }
    }

    try {
      const result = await fetchViewings("/dashboard/appointments/my", filters, true)
      return {
        ...result,
        data: mergeViewingsWithLocal(result.data, filters.status),
        denied: false,
        source: "appointments/my",
      }
    } catch (error) {
      if (!isAccessError(error)) throw error
      if (error instanceof ApiClientError && error.isForbidden()) {
        markViewingsApiDenied()
      }
    }

    const local = listLocalViewings(filters.status)
    return {
      ...emptyViewings(local),
      denied: true,
      source: local.length ? "local" : "none",
    }
  },

  /**
   * OpenAPI: GET /api/dashboard/viewings/schedule
   * Docs also expose appointments/schedule on newer backends.
   * Both require list permissions — 403 without them.
   */
  async getSchedule(filters: ViewingFilters = {}): Promise<ViewingsResponse> {
    const user = getStoredUser()
    if (!canListViewingsFromApi(user)) {
      return emptyViewings(listLocalViewings(filters.status))
    }
    try {
      return await fetchViewings("/dashboard/viewings/schedule", filters, true)
    } catch (error) {
      if (error instanceof ApiClientError && error.isForbidden()) {
        markViewingsApiDenied()
        return emptyViewings(listLocalViewings(filters.status))
      }
      if (isAccessError(error)) {
        try {
          return await fetchViewings("/dashboard/appointments/schedule", filters, true)
        } catch (nested) {
          if (nested instanceof ApiClientError && nested.isForbidden()) {
            markViewingsApiDenied()
          }
          if (isAccessError(nested)) {
            return emptyViewings(listLocalViewings(filters.status))
          }
          throw nested
        }
      }
      throw error
    }
  },

  /**
   * OpenAPI: GET /api/dashboard/viewings/calendar?from&to
   * Do not chain to appointments/calendar after 403 — same permission gate.
   */
  async getCalendar(from?: string, to?: string): Promise<CalendarViewingEvent[]> {
    const user = getStoredUser()
    if (!canListViewingsFromApi(user)) {
      return listLocalCalendarEvents(from, to)
    }
    const params: Record<string, string> = {}
    if (from) params.from = from
    if (to) params.to = to
    try {
      const response = await apiClient.get<ApiResponse<CalendarViewingEvent[]>>(
        "/dashboard/viewings/calendar",
        { params, silent: true }
      )
      const data = getApiData(response)
      return Array.isArray(data) ? data : []
    } catch (error) {
      if (error instanceof ApiClientError && error.isForbidden()) {
        markViewingsApiDenied()
        return listLocalCalendarEvents(from, to)
      }
      if (!isAccessError(error)) throw error
      // 404 only → try appointments alias from newer OpenAPI
      try {
        const response = await apiClient.get<ApiResponse<CalendarViewingEvent[]>>(
          "/dashboard/appointments/calendar",
          { params, silent: true }
        )
        const data = getApiData(response)
        return Array.isArray(data) ? data : []
      } catch (nested) {
        if (nested instanceof ApiClientError && nested.isForbidden()) {
          markViewingsApiDenied()
        }
        if (isAccessError(nested)) return listLocalCalendarEvents(from, to)
        throw nested
      }
    }
  },

  async getById(id: number): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.get<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}`,
        { silent: true }
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.get<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}`,
        { silent: true }
      )
      return getApiData(response)
    }
  },

  /**
   * Book a new viewing for a property.
   * OpenAPI: POST /api/dashboard/viewings (needs viewings.create).
   * On 403, store locally so My Viewings still works without list permission.
   */
  async create(request: CreateViewingRequest): Promise<PropertyViewingDto> {
    const user = getStoredUser()
    try {
      const response = await apiClient.post<ApiResponse<PropertyViewingDto>>(
        "/dashboard/viewings",
        request
      )
      const viewing = getApiData(response)
      upsertLocalViewing(viewing)
      return viewing
    } catch (error) {
      if (!isAccessError(error)) throw error
      try {
        const response = await apiClient.post<ApiResponse<PropertyViewingDto>>(
          "/dashboard/appointments",
          request
        )
        const viewing = getApiData(response)
        upsertLocalViewing(viewing)
        return viewing
      } catch (nested) {
        if (!isAccessError(nested)) throw nested
        return createLocalViewing(request, user?.id ?? 0)
      }
    }
  },

  async reschedule(id: number, request: RescheduleViewingRequest): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}/reschedule`,
        request
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}/reschedule`,
        request
      )
      return getApiData(response)
    }
  },

  async confirm(id: number): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}/confirm`
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}/confirm`
      )
      return getApiData(response)
    }
  },

  async cancel(id: number, request: CancelViewingRequest = {}): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}/cancel`,
        request
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}/cancel`,
        request
      )
      return getApiData(response)
    }
  },

  async complete(id: number): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}/complete`
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}/complete`
      )
      return getApiData(response)
    }
  },

  async markNoShow(id: number): Promise<PropertyViewingDto> {
    try {
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/viewings/${id}/no-show`
      )
      return getApiData(response)
    } catch (error) {
      if (!isAccessError(error)) throw error
      const response = await apiClient.patch<ApiResponse<PropertyViewingDto>>(
        `/dashboard/appointments/${id}/no-show`
      )
      return getApiData(response)
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/dashboard/viewings/${id}`)
    } catch (error) {
      if (!isAccessError(error)) throw error
      await apiClient.delete(`/dashboard/appointments/${id}`)
    }
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
