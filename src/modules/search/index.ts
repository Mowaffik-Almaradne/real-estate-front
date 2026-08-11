export type {
  SearchSuggestion,
  RecentSearch,
} from "./types"
export {
  MAX_RECENT_SEARCHES,
  MAX_SUGGESTIONS,
  SUGGESTION_DEBOUNCE_MS,
} from "./types"
export {
  fetchSuggestions,
  loadRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "./searchService"
export { useRecentSearches } from "./useRecentSearches"
export { useSearchSuggestions } from "./useSearchSuggestions"
export { SearchAutocomplete } from "./components/SearchAutocomplete"
export {
  AdvancedFilters,
  EMPTY_ADVANCED_FILTERS,
} from "./components/AdvancedFilters"
export type { AdvancedFilterValues } from "./components/AdvancedFilters"