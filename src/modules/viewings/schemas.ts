import { z } from "zod"
import { ViewingStatus, ViewingType } from "@/types/enums"

const isoDateTime = z
  .string()
  .min(1, "Date and time are required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  })
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: "Scheduled time must be in the future",
  })

const viewingTypeSchema = z.enum([
  ViewingType.in_person,
  ViewingType.virtual,
  ViewingType.open_house,
])

const statusSchema = z.enum([
  ViewingStatus.pending,
  ViewingStatus.confirmed,
  ViewingStatus.rescheduled,
  ViewingStatus.cancelled,
  ViewingStatus.completed,
  ViewingStatus.no_show,
])

export const bookViewingSchema = z.object({
  scheduled_at: isoDateTime,
  duration_minutes: z
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(240, "Duration must be at most 240 minutes")
    .default(60),
  buffer_minutes: z
    .number()
    .int()
    .min(0, "Buffer cannot be negative")
    .max(60, "Buffer must be at most 60 minutes")
    .default(0),
  viewing_type: viewingTypeSchema,
  contact_name: z.string().max(255).optional().or(z.literal("")),
  contact_phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  max_attendees: z
    .number()
    .int()
    .min(1, "At least one attendee required")
    .max(50, "Maximum 50 attendees")
    .default(1),
})

export type BookViewingValues = z.input<typeof bookViewingSchema>

export const rescheduleViewingSchema = z.object({
  scheduled_at: isoDateTime,
  duration_minutes: z
    .number()
    .int()
    .min(15)
    .max(240)
    .optional(),
  buffer_minutes: z
    .number()
    .int()
    .min(0)
    .max(60)
    .optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
})

export type RescheduleViewingValues = z.input<typeof rescheduleViewingSchema>

export const cancelViewingSchema = z.object({
  cancellation_reason: z
    .string()
    .min(3, "Please provide a brief reason")
    .max(500, "Reason is too long"),
})

export type CancelViewingValues = z.input<typeof cancelViewingSchema>

export const viewingStatusSchema = statusSchema
export type ViewingStatusValue = z.infer<typeof viewingStatusSchema>

export const viewingFiltersSchema = z.object({
  status: statusSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
})
export type ViewingFiltersValues = z.input<typeof viewingFiltersSchema>
