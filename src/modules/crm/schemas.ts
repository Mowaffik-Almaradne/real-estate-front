import { z } from "zod"
import { LEAD_SOURCES, LEAD_STATUSES } from "./types"

export const leadSourceSchema = z.enum(LEAD_SOURCES)
export const leadStatusSchema = z.enum(LEAD_STATUSES)

export const createLeadSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  phone: z
    .string()
    .min(3, "Phone is required")
    .max(32, "Phone is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .max(120, "Email is too long")
    .optional()
    .or(z.literal("")),
  source: leadSourceSchema,
  status: leadStatusSchema.optional(),
})

export type CreateLeadValues = z.input<typeof createLeadSchema>

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(3).max(32).optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(120)
    .optional()
    .or(z.literal("")),
  source: leadSourceSchema.optional(),
})

export type UpdateLeadValues = z.input<typeof updateLeadSchema>

export const updateLeadStatusSchema = z
  .object({
    status: leadStatusSchema,
    lost_reason: z
      .string()
      .max(500, "Reason is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (value) =>
      value.status !== "lost" || (value.lost_reason && value.lost_reason.trim().length > 0),
    {
      message: "A reason is required when marking a lead as lost",
      path: ["lost_reason"],
    }
  )

export type UpdateLeadStatusValues = z.input<typeof updateLeadStatusSchema>

export const createLeadNoteSchema = z.object({
  body: z
    .string()
    .min(1, "Note cannot be empty")
    .max(5000, "Note is too long"),
})

export type CreateLeadNoteValues = z.input<typeof createLeadNoteSchema>

export const updateLeadNoteSchema = z.object({
  body: z.string().min(1).max(5000),
})

export type UpdateLeadNoteValues = z.input<typeof updateLeadNoteSchema>

export const leadFiltersSchema = z.object({
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
})

export type LeadFiltersValues = z.input<typeof leadFiltersSchema>
