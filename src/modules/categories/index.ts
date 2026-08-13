export type {
  Category,
  CategoryFilters,
  CategoryTreeNode,
  CreateCategoryRequest,
  CategoryType,
  UpdateCategoryRequest,
} from "./types"

export { CATEGORY_NAME_MAX, CATEGORY_TYPES } from "./types"

export {
  categoryService,
  CategoryServiceError,
} from "./services/categoryService"

export {
  createCategorySchema,
  updateCategorySchema,
  categoryFiltersSchema,
  type CreateCategoryValues,
  type UpdateCategoryValues,
  type CategoryFiltersValues,
} from "./schemas"

export { useCategories, type UseCategoriesResult } from "./hooks/useCategories"

export {
  useCategoriesTranslations,
  getCategoriesMessages,
} from "./locales/useCategoriesTranslations"

export { CategoryList } from "./components/CategoryList"
export { CategoryFormDialog } from "./components/CategoryFormDialog"
export { CategoryDeleteDialog } from "./components/CategoryDeleteDialog"
export { CategoryFiltersBar } from "./components/CategoryFiltersBar"
