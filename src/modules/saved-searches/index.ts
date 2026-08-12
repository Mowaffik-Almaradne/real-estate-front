export {
  savedSearchService,
  SavedSearchServiceError,
} from "./services/savedSearchService"
export type {
  AlertFrequency,
  CreateSavedSearchRequest,
  SavedSearch,
  SavedSearchFilters,
  SavedSearchesResponse,
  UpdateSavedSearchRequest,
} from "./types"
export {
  ALERT_FREQUENCIES,
  DEFAULT_ALERT_FREQUENCY,
  EMPTY_SAVED_SEARCH_FILTERS,
  SAVED_SEARCH_NAME_MAX,
  filtersFromQuery,
  filtersToQuery,
  isEmptyFilters,
} from "./types"