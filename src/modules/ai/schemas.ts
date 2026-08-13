import { z } from "zod"
import {
  AI_DESCRIPTION_LANGUAGES,
  AI_DESCRIPTION_MAX,
  AI_SEARCH_QUERY_MAX,
  AI_SEARCH_QUERY_MIN,
} from "./types/enums"

const languageSchema = z
  .enum([AI_DESCRIPTION_LANGUAGES[0], AI_DESCRIPTION_LANGUAGES[1]] as [string, ...string[]])
  .optional()

export const aiSearchSchema = z.object({
  query: z
    .string()
    .min(AI_SEARCH_QUERY_MIN, "ai.errors.queryTooShort")
    .max(AI_SEARCH_QUERY_MAX, "ai.errors.queryTooLong"),
})

export type AiSearchValues = z.input<typeof aiSearchSchema>

export const aiGenerateSchema = z.object({
  language: languageSchema,
})

export type AiGenerateValues = z.input<typeof aiGenerateSchema>

export const aiImproveSchema = z.object({
  description: z
    .string()
    .min(1, "ai.errors.descriptionRequired")
    .max(AI_DESCRIPTION_MAX, "ai.errors.descriptionRequired"),
  language: languageSchema,
})

export type AiImproveValues = z.input<typeof aiImproveSchema>

export const aiSuggestTitleSchema = z.object({
  language: languageSchema,
})

export type AiSuggestTitleValues = z.input<typeof aiSuggestTitleSchema>

export const aiSuggestFeaturesSchema = z.object({
  property_type: z
    .string()
    .min(1, "ai.errors.propertyTypeRequired")
    .max(64, "ai.errors.propertyTypeRequired"),
  language: languageSchema,
})

export type AiSuggestFeaturesValues = z.input<typeof aiSuggestFeaturesSchema>
