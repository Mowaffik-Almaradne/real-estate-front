import { z } from "zod"
import { DiscountType } from "@/types/enums"
import { SUBSCRIPTION_DISCOUNT_CODE_MAX } from "./types"

const codeRegex = /^[A-Za-z0-9_-]+$/

export const discountTypeSchema = z.enum([
  DiscountType.percentage,
  DiscountType.fixed,
])

export const subscriptionDiscountFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(
      SUBSCRIPTION_DISCOUNT_CODE_MAX,
      `Code must be at most ${SUBSCRIPTION_DISCOUNT_CODE_MAX} characters`
    )
    .regex(
      codeRegex,
      "Code may only contain letters, numbers, dashes or underscores"
    ),
  type: discountTypeSchema,
  value: z
    .number({ error: "Value must be a number" })
    .min(0, "Value must be 0 or greater"),
  plan_id: z.number().int().positive().nullable().optional(),
  max_uses: z.number().int().min(1, "Max uses must be at least 1").nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export type SubscriptionDiscountFormValues = z.infer<typeof subscriptionDiscountFormSchema>

export const validateCouponRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(
      SUBSCRIPTION_DISCOUNT_CODE_MAX,
      `Code must be at most ${SUBSCRIPTION_DISCOUNT_CODE_MAX} characters`
    ),
  plan_id: z.number().int().positive().nullable().optional(),
})

export type ValidateCouponFormValues = z.infer<typeof validateCouponRequestSchema>
