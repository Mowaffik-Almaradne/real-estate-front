export const CATEGORY_TYPES = ["property", "car"] as const

export type CategoryType = (typeof CATEGORY_TYPES)[number]

export const CATEGORY_NAME_MAX = 255

export interface Category {
  id: number
  name: string
  type: CategoryType
  parent_id?: number | null
  parent?: Category | null
  children?: Category[] | null
  properties_count?: number
  is_protected?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  parent_id?: number | null
}

export interface UpdateCategoryRequest {
  name?: string
  type?: CategoryType
  parent_id?: number | null
}

export interface CategoryFilters {
  type?: CategoryType
  search?: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}
