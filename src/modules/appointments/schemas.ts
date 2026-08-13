import { z } from "zod"
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CONTACT_METHODS,
  VIEWING_TYPES,
} from "./types"

const isoDateTime = z
  .string()
  .min(1, "Date and time are required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  })
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: "Scheduled time must be in the future",
  })

const futureIsoDateTime = (required: boolean) => {
  const base = z
    .string()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      message: "Invalid date",
    })
    .refine(
      (value) => !value || new Date(value).getTime() > Date.now(),
      { message: "Scheduled time must be in the future" }
    )
  return required ? isoDateTime : base
}

export const appointmentTypeSchema = z.enum(APPOINTMENT_TYPES)
export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES)
export const viewingTypeSchema = z.enum(VIEWING_TYPES)
export const contactMethodSchema = z.enum(CONTACT_METHODS)

export const createAppointmentSchema = z
  .object({
    type: appointmentTypeSchema.optional(),
    property_id: z.number().int().positive().nullable().optional(),
    scheduled_at: isoDateTime,
    duration_minutes: z
      .number()
      .int()
      .min(15, "Duration must be at least 15 minutes")
      .max(240, "Duration must be at most 240 minutes")
      .optional(),
    buffer_minutes: z
      .number()
      .int()
      .min(0, "Buffer cannot be negative")
      .max(60, "Buffer must be at most 60 minutes")
      .optional(),
    viewing_type: viewingTypeSchema.nullable().optional(),
    contact_method: contactMethodSchema.nullable().optional(),
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
      .optional(),
  })
  .refine(
    (value) =>
      value.type !== "viewing" || value.property_id != null,
    {
      message: "Property is required for viewings",
      path: ["property_id"],
    }
  )

export type CreateAppointmentValues = z.input<typeof createAppointmentSchema>

export const createFollowUpSchema = z.object({
  followable_id: z.number().int().positive("Followable entity is required"),
  followable_type: z.string().min(1, "Followable type is required").max(255),
  agent_id: z.number().int().positive("Agent is required"),
  scheduled_at: isoDateTime,
  contact_method: contactMethodSchema.nullable().optional(),
  duration_minutes: z.number().int().min(15).max(240).optional(),
  buffer_minutes: z.number().int().min(0).max(60).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
  contact_name: z.string().max(255).optional().or(z.literal("")),
  contact_phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
})

export type CreateFollowUpValues = z.input<typeof createFollowUpSchema>

export const updateAppointmentStatusSchema = z
  .object({
    status: appointmentStatusSchema,
    cancellation_reason: z
      .string()
      .max(500, "Reason is too long")
      .optional()
      .or(z.literal("")),
    agent_notes: z.string().max(1000).optional().or(z.literal("")),
    scheduled_at: futureIsoDateTime(false).optional(),
  })
  .refine(
    (value) =>
      value.status !== "cancelled" ||
      (value.cancellation_reason && value.cancellation_reason.trim().length > 0),
    {
      message: "Cancellation reason is required",
      path: ["cancellation_reason"],
    }
  )
  .refine(
    (value) =>
      value.status !== "rescheduled" || (value.scheduled_at && value.scheduled_at.length > 0),
    {
      message: "New scheduled time is required to reschedule",
      path: ["scheduled_at"],
    }
  )

export type UpdateAppointmentStatusValues = z.input<typeof updateAppointmentStatusSchema>

export const appointmentFiltersSchema = z.object({
  status: appointmentStatusSchema.optional(),
  type: appointmentTypeSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
})

export type AppointmentFiltersValues = z.input<typeof appointmentFiltersSchema>
