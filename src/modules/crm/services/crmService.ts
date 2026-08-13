import {
  apiClient,
  ApiClientError,
  getApiData,
  getApiPagination,
  type ApiResponse,
  type ApiPagination,
} from "@/lib/apiClient"
import type {
  CrmDashboardSummary,
  CrmTodaySnapshot,
  CreateLeadNoteRequest,
  CreateLeadRequest,
  Lead,
  LeadDuplicateResult,
  LeadFilters,
  LeadNote,
  LeadsResponse,
  UpdateLeadNoteRequest,
  UpdateLeadRequest,
  UpdateLeadStatusRequest,
} from "../types"

export { ApiClientError as CrmServiceError }

type UnknownRecord = Record<string, unknown>

const EMPTY_PAGINATION: ApiPagination = {
  total: 0,
  per_page: 0,
  current_page: 1,
  last_page: 1,
  from: null,
  to: null,
}

function emptyLeads(data: Lead[] = []): LeadsResponse {
  return {
    data,
    pagination: { ...EMPTY_PAGINATION, total: data.length, to: data.length },
  }
}

function buildParams(filters: LeadFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.source) params.source = filters.source
  if (filters.search) params.search = filters.search
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

export const leadService = {
  async list(filters: LeadFilters = {}): Promise<LeadsResponse> {
    const response = await apiClient.get<ApiResponse<Lead[]>>("/dashboard/crm/leads", {
      params: buildParams(filters),
      silent: true,
    })
    const data = getApiData(response)
    return {
      data: Array.isArray(data) ? data : [],
      pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
    }
  },

  async listArchived(filters: LeadFilters = {}): Promise<LeadsResponse> {
    const response = await apiClient.get<ApiResponse<Lead[]>>(
      "/dashboard/crm/leads/archived",
      { params: buildParams(filters), silent: true }
    )
    const data = getApiData(response)
    return {
      data: Array.isArray(data) ? data : [],
      pagination: getApiPagination(response) ?? { ...EMPTY_PAGINATION },
    }
  },

  async checkDuplicate(query: { phone?: string; email?: string }): Promise<LeadDuplicateResult> {
    const params: Record<string, string> = {}
    if (query.phone) params.phone = query.phone
    if (query.email) params.email = query.email
    const response = await apiClient.get<ApiResponse<LeadDuplicateResult>>(
      "/dashboard/crm/leads/check-duplicate",
      { params, silent: true }
    )
    return getApiData(response)
  },

  async create(request: CreateLeadRequest): Promise<Lead> {
    const response = await apiClient.post<ApiResponse<Lead>>(
      "/dashboard/crm/leads",
      request
    )
    return getApiData(response)
  },

  async update(id: number, request: UpdateLeadRequest): Promise<Lead> {
    const response = await apiClient.patch<ApiResponse<Lead>>(
      `/dashboard/crm/leads/${id}`,
      request
    )
    return getApiData(response)
  },

  async updateStatus(id: number, request: UpdateLeadStatusRequest): Promise<Lead> {
    const response = await apiClient.patch<ApiResponse<Lead>>(
      `/dashboard/crm/leads/${id}/status`,
      request
    )
    return getApiData(response)
  },

  async archive(id: number): Promise<Lead> {
    const response = await apiClient.post<ApiResponse<Lead>>(
      `/dashboard/crm/leads/${id}/archive`
    )
    return getApiData(response)
  },

  async restore(id: number): Promise<Lead> {
    const response = await apiClient.post<ApiResponse<Lead>>(
      `/dashboard/crm/leads/${id}/restore`
    )
    return getApiData(response)
  },

  async exportCsv(): Promise<Blob> {
    const response = await apiClient.get<Blob>("/dashboard/crm/leads/export", {
      responseType: "blob",
    })
    return response.data
  },
}

export const leadNoteService = {
  async list(leadId: number): Promise<LeadNote[]> {
    const response = await apiClient.get<ApiResponse<LeadNote[]>>(
      `/dashboard/crm/leads/${leadId}/notes`,
      { silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  async create(leadId: number, request: CreateLeadNoteRequest): Promise<LeadNote> {
    const response = await apiClient.post<ApiResponse<LeadNote>>(
      `/dashboard/crm/leads/${leadId}/notes`,
      request
    )
    return getApiData(response)
  },

  async update(noteId: number, request: UpdateLeadNoteRequest): Promise<LeadNote> {
    const response = await apiClient.patch<ApiResponse<LeadNote>>(
      `/dashboard/crm/notes/${noteId}`,
      request
    )
    return getApiData(response)
  },

  async remove(noteId: number): Promise<void> {
    await apiClient.delete(`/dashboard/crm/notes/${noteId}`)
  },
}

export const crmDashboardService = {
  async getSummary(): Promise<CrmDashboardSummary | null> {
    try {
      const response = await apiClient.get<ApiResponse<CrmDashboardSummary>>(
        "/dashboard/crm/dashboard/summary",
        { silent: true }
      )
      return getApiData(response)
    } catch (error) {
      if (isAccessError(error)) return null
      throw error
    }
  },

  async getToday(): Promise<CrmTodaySnapshot | null> {
    try {
      const response = await apiClient.get<ApiResponse<CrmTodaySnapshot>>(
        "/dashboard/crm/dashboard/today",
        { silent: true }
      )
      return getApiData(response)
    } catch (error) {
      if (isAccessError(error)) return null
      throw error
    }
  },
}
