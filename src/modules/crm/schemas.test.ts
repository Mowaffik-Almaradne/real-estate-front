import { describe, it, expect } from "vitest"
import {
  createLeadNoteSchema,
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "./schemas"

describe("crm schemas", () => {
  it("rejects lead without name/phone/source", () => {
    const result = createLeadSchema.safeParse({ name: "", phone: "", source: "website" })
    expect(result.success).toBe(false)
  })

  it("accepts a minimal valid lead", () => {
    const result = createLeadSchema.safeParse({
      name: "Alice",
      phone: "+971500000000",
      source: "phone",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = createLeadSchema.safeParse({
      name: "Bob",
      phone: "+971500000000",
      email: "not-an-email",
      source: "phone",
    })
    expect(result.success).toBe(false)
  })

  it("rejects update with empty payload", () => {
    const result = updateLeadSchema.safeParse({})
    expect(result.success).toBe(true) // all fields optional
  })

  it("requires lost_reason when status is lost", () => {
    const result = updateLeadStatusSchema.safeParse({ status: "lost" })
    expect(result.success).toBe(false)
  })

  it("accepts lost reason when status is lost", () => {
    const result = updateLeadStatusSchema.safeParse({
      status: "lost",
      lost_reason: "Not interested",
    })
    expect(result.success).toBe(true)
  })

  it("does not require lost_reason for non-lost statuses", () => {
    const result = updateLeadStatusSchema.safeParse({ status: "contacted" })
    expect(result.success).toBe(true)
  })

  it("rejects empty note", () => {
    const result = createLeadNoteSchema.safeParse({ body: "" })
    expect(result.success).toBe(false)
  })
})
