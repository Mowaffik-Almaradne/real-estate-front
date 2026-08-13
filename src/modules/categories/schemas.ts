import { z } from "zod"
import { CATEGORY_NAME_MAX, CATEGORY_TYPES } from "./types"

export const categoryTypeSchema = z.enum(CATEGORY_TYPES)

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(CATEGORY_NAME_MAX, "Name is too long"),
  type: categoryTypeSchema,
  parent_id: z.number().int().positive().nullable().optional(),
})

export type CreateCategoryValues = z.input<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(CATEGORY_NAME_MAX)
    .optional(),
  type: categoryTypeSchema.optional(),
  parent_id: z.number().int().positive().nullable().optional(),
})

export type UpdateCategoryValues = z.input<typeof updateCategorySchema>

export const categoryFiltersSchema = z.object({
  type: categoryTypeSchema.optional(),
  search: z.string().max(200).optional(),
})

export type CategoryFiltersValues = z.input<typeof categoryFiltersSchema>
