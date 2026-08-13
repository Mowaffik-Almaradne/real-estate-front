import { z } from "zod"
import { FeatureType } from "@/types/enums"
import {
  SUBSCRIPTION_FEATURE_DESCRIPTION_MAX,
  SUBSCRIPTION_FEATURE_NAME_MAX,
  SUBSCRIPTION_FEATURE_SLUG_MAX,
  SUBSCRIPTION_PLAN_DESCRIPTION_MAX,
  SUBSCRIPTION_PLAN_NAME_MAX,
  SUBSCRIPTION_PLAN_SLUG_MAX,
} from "./types/plans"

const slugRegex = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i

export const featureTypeSchema = z.enum([
  FeatureType.toggle,
  FeatureType.limit,
])

export const subscriptionPlanFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(
      SUBSCRIPTION_PLAN_NAME_MAX,
      `Name must be at most ${SUBSCRIPTION_PLAN_NAME_MAX} characters`
    ),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(
      SUBSCRIPTION_PLAN_SLUG_MAX,
      `Slug must be at most ${SUBSCRIPTION_PLAN_SLUG_MAX} characters`
    )
    .regex(slugRegex, "Slug may only contain letters, numbers, dashes or underscores"),
  description: z
    .string()
    .trim()
    .max(
      SUBSCRIPTION_PLAN_DESCRIPTION_MAX,
      `Description must be at most ${SUBSCRIPTION_PLAN_DESCRIPTION_MAX} characters`
    )
    .optional()
    .or(z.literal("")),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price must be 0 or greater"),
  currency: z
    .string()
    .trim()
    .max(3, "Currency must be a 3-letter ISO code")
    .optional()
    .or(z.literal("")),
  duration_days: z
    .number({ error: "Duration must be a number" })
    .int("Duration must be a whole number of days")
    .min(1, "Duration must be at least 1 day"),
  is_active: z.boolean().optional(),
  sort_order: z
    .number({ error: "Sort order must be a number" })
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater")
    .optional(),
})

export type SubscriptionPlanFormValues = z.infer<typeof subscriptionPlanFormSchema>

export const subscriptionFeatureFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(
      SUBSCRIPTION_FEATURE_NAME_MAX,
      `Name must be at most ${SUBSCRIPTION_FEATURE_NAME_MAX} characters`
    ),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(
      SUBSCRIPTION_FEATURE_SLUG_MAX,
      `Slug must be at most ${SUBSCRIPTION_FEATURE_SLUG_MAX} characters`
    )
    .regex(slugRegex, "Slug may only contain letters, numbers, dashes or underscores"),
  type: featureTypeSchema,
  description: z
    .string()
    .trim()
    .max(
      SUBSCRIPTION_FEATURE_DESCRIPTION_MAX,
      `Description must be at most ${SUBSCRIPTION_FEATURE_DESCRIPTION_MAX} characters`
    )
    .optional()
    .or(z.literal("")),
})

export type SubscriptionFeatureFormValues = z.infer<typeof subscriptionFeatureFormSchema>
