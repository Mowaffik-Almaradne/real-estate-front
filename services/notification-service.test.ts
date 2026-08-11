import { describe, it, expect, vi, beforeEach } from "vitest"
import { notificationService } from "./notification-service"

const mockGet = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: (response: { data: unknown }) => {
    const payload = response.data as { pagination?: unknown; meta?: unknown; data?: unknown }
    if (payload.pagination) return payload.pagination
    if (payload.meta) return payload.meta
    return undefined
  },
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

function makeNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: "n_1",
    type: "property_inquiry",
    title: "New inquiry",
    body: "Someone asked about your listing",
    data: null,
    read_at: null,
    created_at: "2026-08-01 10:00:00",
    ...overrides,
  }
}

describe("notificationService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getNotifications", () => {
    it("GETs /notifications with default page=1 and per_page=20 when no args are passed", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await notificationService.getNotifications()
      expect(mockGet).toHaveBeenCalledWith("/notifications", {
        params: { page: 1, per_page: 20 },
      })
    })

    it("forwards the explicit page and perPage values as page and per_page", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [] } })
      await notificationService.getNotifications(3, 50)
      expect(mockGet).toHaveBeenCalledWith("/notifications", {
        params: { page: 3, per_page: 50 },
      })
    })

    it("returns the unwrapped data array with the pagination meta envelope", async () => {
      const pagination = {
        total: 100,
        per_page: 20,
        current_page: 2,
        last_page: 5,
        from: 21,
        to: 40,
      }
      const notifications = [makeNotification(), makeNotification({ id: "n_2" })]
      mockGet.mockResolvedValueOnce({ data: { data: notifications, pagination } })
      const result = await notificationService.getNotifications(2, 20)
      expect(result.data).toEqual(notifications)
      expect(result.meta).toEqual({
        current_page: 2,
        total: 100,
        per_page: 20,
      })
    })
  })

  describe("getUnreadCount", () => {
    it("GETs /notifications/unread-count and returns the unwrapped count", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { unread_count: 7 } } })
      const result = await notificationService.getUnreadCount()
      expect(mockGet).toHaveBeenCalledWith("/notifications/unread-count")
      expect(result).toBe(7)
    })
  })

  describe("markAsRead", () => {
    it("PATCHes /notifications/{id}/read with no body", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: null } })
      await notificationService.markAsRead("n_1")
      expect(mockPatch).toHaveBeenCalledWith("/notifications/n_1/read")
    })
  })

  describe("markAllAsRead", () => {
    it("PATCHes /notifications/read-all with no body", async () => {
      mockPatch.mockResolvedValueOnce({ data: { data: null } })
      await notificationService.markAllAsRead()
      expect(mockPatch).toHaveBeenCalledWith("/notifications/read-all")
    })
  })

  describe("deleteNotification", () => {
    it("DELETEs /notifications/{id}", async () => {
      mockDelete.mockResolvedValueOnce({ data: { data: null } })
      await notificationService.deleteNotification("n_1")
      expect(mockDelete).toHaveBeenCalledWith("/notifications/n_1")
    })
  })
})
