import { z } from "zod"
import {
  RENTAL_CARD_END_REASON_MAX,
  RENTAL_CARD_EXTERNAL_TENANT_EMAIL_MAX,
  RENTAL_CARD_EXTERNAL_TENANT_NAME_MAX,
  RENTAL_CARD_EXTERNAL_TENANT_NOTES_MAX,
  RENTAL_CARD_EXTERNAL_TENANT_PHONE_MAX,
  RENTAL_CARD_NOTES_MAX,
  RENTAL_CARD_PHOTO_MAX_BYTES,
  RENTAL_CARD_PHOTO_MIME,
  RENTAL_CARD_PHOTOS_MAX,
  RENTAL_CARD_SEARCH_MAX,
  RENTAL_CARD_TERMS_MAX,
  RentalCardStatus,
} from "./types/enums"

const PHOTO_MIME_SET = new Set<string>(RENTAL_CARD_PHOTO_MIME)

function dateString(value: string): boolean {
  if (!value) return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

function isoToday(): string {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

const tenantModeSchema = z.enum(["registered", "external"])
export type TenantModeValue = z.infer<typeof tenantModeSchema>

const photoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= RENTAL_CARD_PHOTO_MAX_BYTES, {
    message: "rentalCards.errors.photoTooLarge",
  })
  .refine(
    (file) => PHOTO_MIME_SET.has(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name),
    { message: "rentalCards.errors.photoType" }
  )

export const createRentalCardSchema = z
  .object({
    property_id: z.coerce
      .number({ error: "Property is required" })
      .int()
      .positive("Property is required"),
    tenant_mode: tenantModeSchema.default("registered"),
    tenant_user_id: z.coerce.number().int().positive().optional().or(z.literal("")),
    external_tenant_name: z
      .string()
      .max(RENTAL_CARD_EXTERNAL_TENANT_NAME_MAX, "Name is too long")
      .optional()
      .or(z.literal("")),
    external_tenant_phone: z
      .string()
      .max(RENTAL_CARD_EXTERNAL_TENANT_PHONE_MAX, "Phone is too long")
      .optional()
      .or(z.literal("")),
    external_tenant_email: z
      .string()
      .email("Invalid email")
      .max(RENTAL_CARD_EXTERNAL_TENANT_EMAIL_MAX, "Email is too long")
      .optional()
      .or(z.literal("")),
    external_tenant_id_notes: z
      .string()
      .max(RENTAL_CARD_EXTERNAL_TENANT_NOTES_MAX, "Notes are too long")
      .optional()
      .or(z.literal("")),
    start_date: z
      .string()
      .min(1, "Start date is required")
      .refine(dateString, "Invalid start date"),
    end_date: z
      .string()
      .min(1, "End date is required")
      .refine(dateString, "Invalid end date"),
    terms: z
      .string()
      .max(RENTAL_CARD_TERMS_MAX, "Terms are too long")
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(RENTAL_CARD_NOTES_MAX, "Notes are too long")
      .optional()
      .or(z.literal("")),
    is_renewable: z.boolean().default(false),
    pre_rental_photos: z
      .array(photoSchema)
      .max(RENTAL_CARD_PHOTOS_MAX, "rentalCards.errors.tooManyPhotos")
      .default([]),
  })
  .superRefine((values, ctx) => {
    const start = new Date(values.start_date)
    const end = new Date(values.end_date)
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "rentalCards.errors.endBeforeStart",
      })
    }
    const today = new Date(isoToday())
    if (start < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date"],
        message: "rentalCards.errors.pastStartDate",
      })
    }
    if (values.tenant_mode === "registered") {
      if (
        values.tenant_user_id === undefined ||
        values.tenant_user_id === null ||
        values.tenant_user_id === "" ||
        Number.isNaN(values.tenant_user_id)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tenant_user_id"],
          message: "rentalCards.errors.missingTenant",
        })
      }
    } else if (!values.external_tenant_name || values.external_tenant_name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["external_tenant_name"],
        message: "rentalCards.errors.missingTenant",
      })
    }
  })

export type CreateRentalCardValues = z.input<typeof createRentalCardSchema>

export const updateRentalCardSchema = z
  .object({
    end_date: z
      .string()
      .min(1, "End date is required")
      .refine(dateString, "Invalid end date")
      .optional(),
    terms: z
      .string()
      .max(RENTAL_CARD_TERMS_MAX, "Terms are too long")
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(RENTAL_CARD_NOTES_MAX, "Notes are too long")
      .optional()
      .or(z.literal("")),
    is_renewable: z.boolean().optional(),
  })
  .strict()

export type UpdateRentalCardValues = z.input<typeof updateRentalCardSchema>

export const endRentalCardSchema = z
  .object({
    ended_at: z
      .string()
      .refine(dateString, "Invalid date")
      .optional()
      .or(z.literal("")),
    end_reason: z
      .string()
      .max(RENTAL_CARD_END_REASON_MAX, "Reason is too long")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.ended_at && values.ended_at.length > 0) {
      const ended = new Date(values.ended_at)
      const today = new Date(isoToday())
      today.setHours(0, 0, 0, 0)
      ended.setHours(0, 0, 0, 0)
      if (ended > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ended_at"],
          message: "rentalCards.errors.endBeforeToday",
        })
      }
    }
  })

export type EndRentalCardValues = z.input<typeof endRentalCardSchema>

export const renewRentalCardSchema = z
  .object({
    end_date: z
      .string()
      .min(1, "New end date is required")
      .refine(dateString, "Invalid end date"),
    terms: z
      .string()
      .max(RENTAL_CARD_TERMS_MAX, "Terms are too long")
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(RENTAL_CARD_NOTES_MAX, "Notes are too long")
      .optional()
      .or(z.literal("")),
  })
  .strict()

export type RenewRentalCardValues = z.input<typeof renewRentalCardSchema>

export const rentalCardFiltersSchema = z.object({
  search: z.string().max(RENTAL_CARD_SEARCH_MAX, "Search is too long").optional(),
  status: z
    .enum([
      RentalCardStatus.active,
      RentalCardStatus.ended,
      RentalCardStatus.cancelled,
      RentalCardStatus.renewed,
    ])
    .optional(),
  property_id: z.coerce.number().int().positive().optional(),
  start_date: z.string().refine(dateString, "Invalid date").optional(),
  end_date: z.string().refine(dateString, "Invalid date").optional(),
  sort_by: z
    .enum(["created_at", "start_date", "end_date"])
    .optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
})

export type RentalCardFiltersValues = z.input<typeof rentalCardFiltersSchema>
