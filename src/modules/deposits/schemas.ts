import { z } from "zod"
import {
  DEPOSIT_AMOUNT_MIN,
  DEPOSIT_CANCEL_REASON_MAX,
  DEPOSIT_CURRENCIES,
  DEPOSIT_NOTES_MAX,
  DEPOSIT_REFUND_NOTES_MAX,
  DEPOSIT_RELEASE_NOTES_MAX,
  DEPOSIT_SORT_COLUMNS,
  DEPOSIT_SORT_ORDERS,
  DEPOSIT_TERMS_MAX,
  DepositStatus,
  PAYMENT_METHODS,
} from "./types/enums"

const amountNumber = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const num = typeof value === "number" ? value : Number(value)
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "deposits.errors.amountRequired",
      })
      return z.NEVER
    }
    if (num < DEPOSIT_AMOUNT_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "deposits.errors.amountPositive",
      })
      return z.NEVER
    }
    return num
  })

export const createDepositSchema = z.object({
  property_id: z.coerce
    .number({ error: "deposits.errors.propertyRequired" })
    .int()
    .positive("deposits.errors.propertyRequired"),
  seller_id: z.coerce
    .number({ error: "deposits.errors.sellerRequired" })
    .int()
    .positive("deposits.errors.sellerRequired"),
  amount: amountNumber,
  currency: z.enum([DEPOSIT_CURRENCIES[0], DEPOSIT_CURRENCIES[1]] as [string, string]).default("SAR"),
  terms: z
    .string()
    .max(DEPOSIT_TERMS_MAX, "deposits.errors.termsTooLong")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(DEPOSIT_NOTES_MAX, "deposits.errors.notesTooLong")
    .optional()
    .or(z.literal("")),
})

export type CreateDepositValues = z.input<typeof createDepositSchema>

export const updateDepositSchema = z
  .object({
    amount: z.union([z.number(), z.string()]).optional(),
    terms: z
      .string()
      .max(DEPOSIT_TERMS_MAX, "deposits.errors.termsTooLong")
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(DEPOSIT_NOTES_MAX, "deposits.errors.notesTooLong")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.amount === undefined || values.amount === null || values.amount === "") return
    const num =
      typeof values.amount === "number" ? values.amount : Number(values.amount)
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "deposits.errors.amountRequired",
      })
      return
    }
    if (num < DEPOSIT_AMOUNT_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "deposits.errors.amountPositive",
      })
    }
  })

export type UpdateDepositValues = z.input<typeof updateDepositSchema>

export const payDepositSchema = z.object({
  payment_method: z.enum(
    PAYMENT_METHODS as unknown as [string, ...string[]]
  ),
})

export type PayDepositValues = z.input<typeof payDepositSchema>

export const releaseDepositSchema = z.object({
  notes: z
    .string()
    .max(DEPOSIT_RELEASE_NOTES_MAX, "deposits.errors.notesTooLong")
    .optional()
    .or(z.literal("")),
})

export type ReleaseDepositValues = z.input<typeof releaseDepositSchema>

export const refundDepositSchema = z.object({
  notes: z
    .string()
    .max(DEPOSIT_REFUND_NOTES_MAX, "deposits.errors.notesTooLong")
    .optional()
    .or(z.literal("")),
})

export type RefundDepositValues = z.input<typeof refundDepositSchema>

export const cancelDepositSchema = z.object({
  reason: z
    .string()
    .min(1, "deposits.errors.reasonRequired")
    .max(DEPOSIT_CANCEL_REASON_MAX, "deposits.errors.reasonRequired"),
})

export type CancelDepositValues = z.input<typeof cancelDepositSchema>

export const depositFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  status: z
    .enum([
      DepositStatus.pending,
      DepositStatus.held,
      DepositStatus.released,
      DepositStatus.refunded,
      DepositStatus.disputed,
      DepositStatus.cancelled,
    ])
    .optional(),
  property_id: z.coerce.number().int().positive().optional(),
  buyer_id: z.coerce.number().int().positive().optional(),
  seller_id: z.coerce.number().int().positive().optional(),
  currency: z.enum([DEPOSIT_CURRENCIES[0], DEPOSIT_CURRENCIES[1]] as [string, string]).optional(),
  sort_by: z.enum([...DEPOSIT_SORT_COLUMNS] as [string, ...string[]]).optional(),
  sort_order: z.enum([...DEPOSIT_SORT_ORDERS] as [string, ...string[]]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
})

export type DepositFiltersValues = z.input<typeof depositFiltersSchema>
