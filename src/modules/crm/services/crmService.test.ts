import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  crmDashboardService,
  leadNoteService,
  leadService,
} from "../services/crmService"
import type { Lead } from "../types"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T } | T
    if (payload && typeof payload === "object" && "data" in (payload as object)) {
      return (payload as { data: T }).data
    }
    return payload as T
  },
  getApiPagination: <T,>(_response: { data: unknown }): T => {
    return {
      total: 0,
      per_page: 0,
      current_page: 1,
      last_page: 1,
      from: null,
      to: null,
    } as T
  },
  ApiClientError: class extends Error {
    status: number
    errors: Record<string, string[]>
    constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
      super(message)
      this.status = status
      this.errors = errors
    }
    isValidation() {
      return this.status === 422
    }
    isUnauthorized() {
      return this.status === 401
    }
    isForbidden() {
      return this.status === 403
    }
    isNotFound() {
      return this.status === 404
    }
    isServerError() {
      return this.status >= 500
    }
  },
}))

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    name: "John Doe",
    phone: "+971500000000",
    email: "john@example.com",
    source: "website",
    status: "new",
    lost_reason: null,
    archived_at: null,
    created_at: "2026-08-01T00:00:00",
    updated_at: "2026-08-01T00:00:00",
    ...overrides,
  }
}

describe("leadService", () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it("lists leads via /dashboard/crm/leads with filters", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makeLead()] } })
    await leadService.list({ status: "qualified", search: "villa", page: 2, perPage: 25 })
    expect(mockGet).toHaveBeenCalledWith("/dashboard/crm/leads", {
      params: { status: "qualified", search: "villa", page: 2, perPage: 25 },
      silent: true,
    })
  })

  it("lists archived leads via /dashboard/crm/leads/archived", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } })
    await leadService.listArchived({ perPage: 50 })
    expect(mockGet).toHaveBeenCalledWith("/dashboard/crm/leads/archived", {
      params: { perPage: 50 },
      silent: true,
    })
  })

  it("checks duplicate lead with phone and email", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          duplicate: true,
          match: { id: 9, name: "Existing", phone: "+971500000000", email: null, status: "contacted", matched_on: "phone" },
        },
      },
    })
    const result = await leadService.checkDuplicate({ phone: "+971500000000" })
    expect(mockGet).toHaveBeenCalledWith("/dashboard/crm/leads/check-duplicate", {
      params: { phone: "+971500000000" },
      silent: true,
    })
    expect(result.duplicate).toBe(true)
    expect(result.match?.matched_on).toBe("phone")
  })

  it("creates a lead via POST /dashboard/crm/leads", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: makeLead() } })
    await leadService.create({
      name: "Jane",
      phone: "+971511111111",
      email: null,
      source: "whatsapp",
      status: "new",
    })
    expect(mockPost).toHaveBeenCalledWith("/dashboard/crm/leads", {
      name: "Jane",
      phone: "+971511111111",
      email: null,
      source: "whatsapp",
      status: "new",
    })
  })

  it("updates a lead via PATCH /dashboard/crm/leads/{id}", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeLead({ name: "Jane Doe" }) } })
    await leadService.update(7, { name: "Jane Doe" })
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/crm/leads/7", { name: "Jane Doe" })
  })

  it("updates lead status with lost_reason when needed", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeLead({ status: "lost", lost_reason: "Out of budget" }) } })
    await leadService.updateStatus(7, { status: "lost", lost_reason: "Out of budget" })
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/crm/leads/7/status", {
      status: "lost",
      lost_reason: "Out of budget",
    })
  })

  it("archives and restores a lead", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: makeLead({ archived_at: "2026-08-12" }) } })
    await leadService.archive(7)
    expect(mockPost).toHaveBeenLastCalledWith("/dashboard/crm/leads/7/archive")

    mockPost.mockResolvedValueOnce({ data: { data: makeLead({ archived_at: null }) } })
    await leadService.restore(7)
    expect(mockPost).toHaveBeenLastCalledWith("/dashboard/crm/leads/7/restore")
  })
})

describe("leadNoteService", () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it("lists notes via /dashboard/crm/leads/{leadId}/notes", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: 1, lead_id: 7, body: "x", created_at: "", updated_at: "" }] },
    })
    await leadNoteService.list(7)
    expect(mockGet).toHaveBeenCalledWith("/dashboard/crm/leads/7/notes", { silent: true })
  })

  it("creates a note via POST /dashboard/crm/leads/{leadId}/notes", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 2, lead_id: 7, body: "call back", created_at: "", updated_at: "" } } })
    await leadNoteService.create(7, { body: "call back" })
    expect(mockPost).toHaveBeenCalledWith("/dashboard/crm/leads/7/notes", { body: "call back" })
  })

  it("patches a note via /dashboard/crm/notes/{noteId}", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 2, lead_id: 7, body: "updated", created_at: "", updated_at: "" } } })
    await leadNoteService.update(2, { body: "updated" })
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/crm/notes/2", { body: "updated" })
  })

  it("deletes a note via /dashboard/crm/notes/{noteId}", async () => {
    mockDelete.mockResolvedValueOnce({ data: null })
    await leadNoteService.remove(2)
    expect(mockDelete).toHaveBeenCalledWith("/dashboard/crm/notes/2")
  })
})

describe("crmDashboardService", () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it("fetches summary and today", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: { data: { total_leads: 12, new_leads: 3, contacted_leads: 4, qualified_leads: 2, won_leads: 1, lost_leads: 2, conversion_rate: 8.3, leads_change: 4.5, won_change: 1.2 } },
      })
      .mockResolvedValueOnce({
        data: { data: { today_leads: 2, new_today: 1, contacted_today: 0, qualified_today: 1, follow_ups_due: 0, upcoming_appointments: 3 } },
      })
    const summary = await crmDashboardService.getSummary()
    const today = await crmDashboardService.getToday()
    expect(summary?.total_leads).toBe(12)
    expect(today?.upcoming_appointments).toBe(3)
    expect(mockGet.mock.calls[0][0]).toBe("/dashboard/crm/dashboard/summary")
    expect(mockGet.mock.calls[1][0]).toBe("/dashboard/crm/dashboard/today")
  })

  it("returns null on access errors for summary", async () => {
    const { ApiClientError } = await import("@/lib/apiClient")
    mockGet.mockRejectedValueOnce(new ApiClientError(403, "Forbidden"))
    const summary = await crmDashboardService.getSummary()
    expect(summary).toBeNull()
  })
})
