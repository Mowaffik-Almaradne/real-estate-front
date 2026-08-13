export const AI_DESCRIPTION_LANGUAGES = ["ar", "en"] as const
export type AiDescriptionLanguage = (typeof AI_DESCRIPTION_LANGUAGES)[number]

export const AI_SEARCH_QUERY_MIN = 5
export const AI_SEARCH_QUERY_MAX = 500
export const AI_DESCRIPTION_MAX = 5000
export const AI_TITLE_SUGGESTIONS_MAX = 20
export const AI_FEATURES_MAX = 50

export function isAiDescriptionLanguage(
  value: string | null | undefined
): value is AiDescriptionLanguage {
  return value === "ar" || value === "en"
}
