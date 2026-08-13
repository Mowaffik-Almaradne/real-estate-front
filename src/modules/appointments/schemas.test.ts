import { describe, it, expect } from "vitest"
import {
  createAppointmentSchema,
  createFollowUpSchema,
  updateAppointmentStatusSchema,
} from "./schemas"

describe("appointments schemas", () => {
  it("rejects viewing without property_id", () => {
    const result = createAppointmentSchema.safeParse({
      type: "viewing",
      scheduled_at: "2099-09-01T10:00:00Z",
    })
    expect(result.success).toBe(false)
  })

  it("accepts viewing with property_id and future date", () => {
    const result = createAppointmentSchema.safeParse({
      type: "viewing",
      property_id: 42,
      scheduled_at: "2099-09-01T10:00:00Z",
      duration_minutes: 60,
    })
    expect(result.success).toBe(true)
  })

  it("rejects past dates", () => {
    const result = createAppointmentSchema.safeParse({
      type: "general",
      scheduled_at: "2000-01-01T00:00:00Z",
    })
    expect(result.success).toBe(false)
  })

  it("rejects follow-up without followable fields", () => {
    const result = createFollowUpSchema.safeParse({
      agent_id: 1,
      scheduled_at: "2099-09-01T10:00:00Z",
    })
    expect(result.success).toBe(false)
  })

  it("requires cancellation reason for cancel", () => {
    const result = updateAppointmentStatusSchema.safeParse({ status: "cancelled" })
    expect(result.success).toBe(false)
  })

  it("requires scheduled_at for reschedule", () => {
    const result = updateAppointmentStatusSchema.safeParse({ status: "rescheduled" })
    expect(result.success).toBe(false)
  })

  it("accepts cancel with reason", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      status: "cancelled",
      cancellation_reason: "Property sold",
    })
    expect(result.success).toBe(true)
  })

  it("accepts reschedule with new time", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      status: "rescheduled",
      scheduled_at: "2099-09-05T11:00:00Z",
    })
    expect(result.success).toBe(true)
  })
})
