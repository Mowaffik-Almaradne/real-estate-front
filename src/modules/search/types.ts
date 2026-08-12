export interface SearchSuggestion {
  id: number
  name: string
  city: string
  country: string
  type: string
  formattedPrice: string
  mainImage: string | null
}

export interface RecentSearch {
  query: string
  timestamp: number
}

export const MAX_RECENT_SEARCHES = 5
export const MAX_SUGGESTIONS = 6
export const SUGGESTION_DEBOUNCE_MS = 250