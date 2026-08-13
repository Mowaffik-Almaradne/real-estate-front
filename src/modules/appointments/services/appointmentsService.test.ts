import { describe, it, expect, vi, beforeEach } from "vitest"
import { appointmentService } from "../services/appointmentsService"
import type { Appointment } from "../types"

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

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    type: "viewing",
    property_id: 42,
    user_id: 7,
    scheduled_at: "2026-09-01T10:00:00Z",
    duration_minutes: 60,
    buffer_minutes: 15,
    max_attendees: 1,
    status: "pending",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    ...overrides,
  }
}

describe("appointmentService", () => {
  beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
  })

  it("lists appointments via /dashboard/appointments with filters", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makeAppointment()] } })
    await appointmentService.list({ status: "pending", type: "viewing", page: 2, perPage: 20 })
    expect(mockGet).toHaveBeenCalledWith("/dashboard/appointments", {
      params: { status: "pending", type: "viewing", page: 2, perPage: 20 },
      silent: true,
    })
  })

  it("lists my appointments via /dashboard/appointments/my", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } })
    await appointmentService.listMine({ status: "confirmed" })
    expect(mockGet).toHaveBeenCalledWith("/dashboard/appointments/my", {
      params: { status: "confirmed" },
      silent: true,
    })
  })

  it("fetches the calendar via /dashboard/appointments/calendar with from/to", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } })
    await appointmentService.getCalendar("2026-08-01", "2026-08-31")
    expect(mockGet).toHaveBeenCalledWith("/dashboard/appointments/calendar", {
      params: { from: "2026-08-01", to: "2026-08-31" },
      silent: true,
    })
  })

  it("fetches schedule via /dashboard/appointments/schedule", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makeAppointment()] } })
    await appointmentService.getSchedule()
    expect(mockGet).toHaveBeenCalledWith("/dashboard/appointments/schedule", { silent: true })
  })

  it("creates an appointment via POST /dashboard/appointments", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: makeAppointment() } })
    await appointmentService.create({
      type: "viewing",
      property_id: 42,
      scheduled_at: "2026-09-01T10:00:00Z",
      duration_minutes: 60,
      contact_name: "Alice",
    })
    expect(mockPost).toHaveBeenCalledWith("/dashboard/appointments", {
      type: "viewing",
      property_id: 42,
      scheduled_at: "2026-09-01T10:00:00Z",
      duration_minutes: 60,
      contact_name: "Alice",
    })
  })

  it("creates a follow-up via POST /dashboard/appointments/follow-ups", async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: makeAppointment({ type: "follow_up", property_id: null }) },
    })
    await appointmentService.createFollowUp({
      followable_id: 9,
      followable_type: "Lead",
      agent_id: 5,
      scheduled_at: "2026-09-02T09:00:00Z",
      contact_method: "call",
    })
    expect(mockPost).toHaveBeenCalledWith("/dashboard/appointments/follow-ups", {
      followable_id: 9,
      followable_type: "Lead",
      agent_id: 5,
      scheduled_at: "2026-09-02T09:00:00Z",
      contact_method: "call",
    })
  })

  it("confirms via PATCH /dashboard/appointments/{id}/confirm", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeAppointment({ status: "confirmed" }) } })
    await appointmentService.confirm(7)
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/appointments/7/confirm")
  })

  it("reschedules via PATCH /dashboard/appointments/{id}/reschedule", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeAppointment({ status: "rescheduled" }) } })
    await appointmentService.reschedule(7, {
      status: "rescheduled",
      scheduled_at: "2026-09-05T11:00:00Z",
      agent_notes: "Customer asked for later",
    })
    expect(mockPatch).toHaveBeenCalledWith(
      "/dashboard/appointments/7/reschedule",
      {
        status: "rescheduled",
        scheduled_at: "2026-09-05T11:00:00Z",
        agent_notes: "Customer asked for later",
      }
    )
  })

  it("cancels via PATCH /dashboard/appointments/{id}/cancel", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeAppointment({ status: "cancelled" }) } })
    await appointmentService.cancel(7, {
      status: "cancelled",
      cancellation_reason: "Property sold",
    })
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/appointments/7/cancel", {
      status: "cancelled",
      cancellation_reason: "Property sold",
    })
  })

  it("marks complete via PATCH /dashboard/appointments/{id}/complete", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeAppointment({ status: "completed" }) } })
    await appointmentService.complete(7)
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/appointments/7/complete")
  })

  it("marks no-show via PATCH /dashboard/appointments/{id}/no-show", async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: makeAppointment({ status: "no_show" }) } })
    await appointmentService.markNoShow(7)
    expect(mockPatch).toHaveBeenCalledWith("/dashboard/appointments/7/no-show")
  })

  it("removes via DELETE /dashboard/appointments/{id}", async () => {
    mockDelete.mockResolvedValueOnce({ data: null })
    await appointmentService.remove(7)
    expect(mockDelete).toHaveBeenCalledWith("/dashboard/appointments/7")
  })
})
