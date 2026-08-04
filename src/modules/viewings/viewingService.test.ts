import { describe, it, expect } from "vitest"
import {
  getStatusAfterAction,
  isSlotConflict,
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
