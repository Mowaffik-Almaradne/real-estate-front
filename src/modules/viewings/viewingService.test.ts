import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getStatusAfterAction,
  isSlotConflict,
  viewingService,
} from "./services/viewingService"
import { ApiClientError } from "@/lib/apiClient"
import { ViewingStatus } from "@/types/enums"

describe("viewing state transitions", () => {
  it("allows publisher to confirm a pending viewing", () => {
    expect(getStatusAfterAction(ViewingStatus.pending, "confirm")).toBe(ViewingStatus.confirmed)
  })

  it("blocks confirm from terminal states", () => {
    expect(getStatusAfterAction(ViewingStatus.cancelled, "confirm")).toBeNull()
    expect(getStatusAfterAction(ViewingStatus.completed, "confirm")).toBeNull()
    expect(getStatusAfterAction(ViewingStatus.no_show, "confirm")).toBeNull()
  })

  it("allows cancellation from active states", () => {
    expect(getStatusAfterAction(ViewingStatus.pending, "cancel")).toBe(ViewingStatus.cancelled)
    expect(getStatusAfterAction(ViewingStatus.confirmed, "cancel")).toBe(ViewingStatus.cancelled)
    expect(getStatusAfterAction(ViewingStatus.rescheduled, "cancel")).toBe(ViewingStatus.cancelled)
  })

  it("blocks cancellation from terminal states", () => {
    expect(getStatusAfterAction(ViewingStatus.cancelled, "cancel")).toBeNull()
    expect(getStatusAfterAction(ViewingStatus.completed, "cancel")).toBeNull()
  })

  it("allows complete and no_show from active states", () => {
    expect(getStatusAfterAction(ViewingStatus.confirmed, "complete")).toBe(ViewingStatus.completed)
    expect(getStatusAfterAction(ViewingStatus.rescheduled, "no_show")).toBe(ViewingStatus.no_show)
  })
})

describe("slot conflict detection", () => {
  it("detects 409 responses as conflicts", () => {
    const error = new ApiClientError(409, "Slot already taken")
    expect(isSlotConflict(error)).toBe(true)
  })

  it("detects keyword matches in error messages", () => {
    expect(isSlotConflict(new ApiClientError(422, "Time slot is unavailable"))).toBe(true)
    expect(isSlotConflict(new ApiClientError(422, "Schedule conflict detected"))).toBe(true)
    expect(isSlotConflict(new ApiClientError(422, "Slot already booked"))).toBe(true)
    expect(isSlotConflict(new ApiClientError(422, "Overlap with another viewing"))).toBe(true)
  })

  it("returns false for unrelated errors", () => {
    expect(isSlotConflict(new ApiClientError(500, "Server error"))).toBe(false)
    expect(isSlotConflict(new ApiClientError(401, "Unauthenticated"))).toBe(false)
    expect(isSlotConflict(new Error("Network down"))).toBe(false)
    expect(isSlotConflict("not an error")).toBe(false)
    expect(isSlotConflict(null)).toBe(false)
  })
})

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
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: () => undefined,
  ApiClientError: class ApiClientError extends Error {
    status: number
    errors: Record<string, string[]>
    constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
      super(message)
      this.status = status
      this.errors = errors
    }
  },
}))

function makeViewing(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    property_id: 10,
    user_id: 2,
    scheduled_at: "2026-09-01 10:00:00",
    duration_minutes: 30,
    status: ViewingStatus.pending,
    viewing_type: "in_person",
    buffer_minutes: 15,
    max_attendees: 4,
    notes: null,
    created_at: "2026-08-15 09:00:00",
    updated_at: "2026-08-15 09:00:00",
    ...overrides,
  }
}

describe("viewingService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list / listMine / getSchedule", () => {
    it("list GETs /dashboard/viewings with serialized filters", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await viewingService.list({
        status: ViewingStatus.pending,
        property_id: 10,
        page: 2,
        perPage: 25,
      })
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings", {
        params: { status: "pending", property_id: 10, page: 2, perPage: 25 },
      })
    })

    it("listMine GETs /dashboard/viewings/my", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await viewingService.listMine()
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings/my", { params: {} })
    })

    it("getSchedule GETs /dashboard/viewings/schedule", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await viewingService.getSchedule({ from: "2026-09-01", to: "2026-09-30" })
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings/schedule", {
        params: { from: "2026-09-01", to: "2026-09-30" },
      })
    })
  })

  describe("getCalendar", () => {
    it("GETs /dashboard/viewings/calendar with optional from/to", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await viewingService.getCalendar("2026-09-01", "2026-09-30")
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings/calendar", {
        params: { from: "2026-09-01", to: "2026-09-30" },
      })
    })

    it("omits from/to when not provided", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await viewingService.getCalendar()
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings/calendar", { params: {} })
    })
  })

  describe("getById", () => {
    it("GETs the viewing by id", async () => {
      const viewing = makeViewing({ id: 7 })
      mockGet.mockResolvedValueOnce({ data: { data: viewing } })
      const result = await viewingService.getById(7)
      expect(mockGet).toHaveBeenCalledWith("/dashboard/viewings/7")
      expect(result).toEqual(viewing)
    })
  })

  describe("create", () => {
    it("POSTs the viewing payload to /dashboard/viewings", async () => {
      const viewing = makeViewing()
      mockPost.mockResolvedValueOnce({ data: { data: viewing } })
      const result = await viewingService.create({
        property_id: 10,
        scheduled_at: "2026-09-01 10:00:00",
        duration_minutes: 30,
        viewing_type: "in_person",
      })
      expect(mockPost).toHaveBeenCalledWith("/dashboard/viewings", {
        property_id: 10,
        scheduled_at: "2026-09-01 10:00:00",
        duration_minutes: 30,
        viewing_type: "in_person",
      })
      expect(result).toEqual(viewing)
    })
  })

  describe("state transition actions", () => {
    it("reschedule PATCHes the reschedule endpoint with the new schedule", async () => {
      const viewing = makeViewing({ status: ViewingStatus.rescheduled })
      mockPatch.mockResolvedValueOnce({ data: { data: viewing } })
      await viewingService.reschedule(7, {
        scheduled_at: "2026-09-02 11:00:00",
        duration_minutes: 45,
      })
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/reschedule", {
        scheduled_at: "2026-09-02 11:00:00",
        duration_minutes: 45,
      })
    })

    it("confirm PATCHes the confirm endpoint with no body", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: makeViewing() } })
      await viewingService.confirm(7)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/confirm")
    })

    it("cancel PATCHes the cancel endpoint with the reason payload", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: makeViewing() } })
      await viewingService.cancel(7, { cancellation_reason: "Property unavailable" })
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/cancel", {
        cancellation_reason: "Property unavailable",
      })
    })

    it("cancel defaults the body to an empty object when no reason is given", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: makeViewing() } })
      await viewingService.cancel(7)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/cancel", {})
    })

    it("complete PATCHes the complete endpoint with no body", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: makeViewing() } })
      await viewingService.complete(7)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/complete")
    })

    it("markNoShow PATCHes the no-show endpoint with no body", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: makeViewing() } })
      await viewingService.markNoShow(7)
      expect(mockPatch).toHaveBeenCalledWith("/dashboard/viewings/7/no-show")
    })
  })

  describe("delete", () => {
    it("DELETEs the viewing by id", async () => {
      mockDelete.mockResolvedValueOnce({ data: { data: null } })
      await viewingService.delete(7)
      expect(mockDelete).toHaveBeenCalledWith("/dashboard/viewings/7")
    })
  })
})
