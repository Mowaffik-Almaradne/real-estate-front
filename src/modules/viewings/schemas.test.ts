import { describe, it, expect } from "vitest"
import {
  bookViewingSchema,
  cancelViewingSchema,
  rescheduleViewingSchema,
} from "./schemas"
import { ViewingType } from "@/types/enums"

const futureIso = (): string =>
  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

const pastIso = (): string =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

describe("bookViewingSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = bookViewingSchema.safeParse({
      scheduled_at: futureIso(),
      duration_minutes: 60,
      buffer_minutes: 15,
      viewing_type: ViewingType.in_person,
      max_attendees: 2,
      contact_phone: "+1 555-0100",
      notes: "Looking forward to it",
    })
    expect(result.success).toBe(true)
  })

  it("rejects past scheduled times", () => {
    const result = bookViewingSchema.safeParse({
      scheduled_at: pastIso(),
      duration_minutes: 60,
      buffer_minutes: 0,
      viewing_type: ViewingType.in_person,
      max_attendees: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects durations below 15 minutes", () => {
    const result = bookViewingSchema.safeParse({
      scheduled_at: futureIso(),
      duration_minutes: 5,
      buffer_minutes: 0,
      viewing_type: ViewingType.in_person,
      max_attendees: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid phone formats", () => {
    const result = bookViewingSchema.safeParse({
      scheduled_at: futureIso(),
      duration_minutes: 60,
      buffer_minutes: 0,
      viewing_type: ViewingType.virtual,
      max_attendees: 1,
      contact_phone: "not-a-phone!!!",
    })
    expect(result.success).toBe(false)
  })
})

describe("rescheduleViewingSchema", () => {
  it("accepts a new future time", () => {
    const result = rescheduleViewingSchema.safeParse({
      scheduled_at: futureIso(),
    })
    expect(result.success).toBe(true)
  })

  it("rejects past times", () => {
    const result = rescheduleViewingSchema.safeParse({
      scheduled_at: pastIso(),
    })
    expect(result.success).toBe(false)
  })
})

describe("cancelViewingSchema", () => {
  it("requires a reason of at least 3 characters", () => {
    const result = cancelViewingSchema.safeParse({ cancellation_reason: "x" })
    expect(result.success).toBe(false)
  })

  it("accepts a valid reason", () => {
    const result = cancelViewingSchema.safeParse({
      cancellation_reason: "Schedule conflict",
    })
    expect(result.success).toBe(true)
  })
})
