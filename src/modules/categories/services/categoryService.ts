import {
  apiClient,
  ApiClientError,
  getApiData,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  Category,
  CategoryFilters,
  CategoryTreeNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types"

export { ApiClientError as CategoryServiceError }

function buildFilters(filters: CategoryFilters = {}): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.type) params.type = filters.type
  if (filters.search) params.search = filters.search
  return params
}

function buildTree(nodes: Category[], parentId: number | null = null): CategoryTreeNode[] {
  return nodes
    .filter((node) => (node.parent_id ?? null) === parentId)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }))
}

export const categoryService = {
  async listPublic(filters: CategoryFilters = {}): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/categories/public",
      { params: buildFilters(filters), silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  async getPublic(id: number): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/categories/public/${id}`,
      { silent: true }
    )
    return getApiData(response)
  },

  async listAdmin(filters: CategoryFilters = {}): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/categories",
      { params: buildFilters(filters), silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  async getTree(type?: CategoryFilters["type"]): Promise<CategoryTreeNode[]> {
    const all = await categoryService.listAdmin({ type })
    return buildTree(all, null)
  },

  async create(payload: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/categories",
      payload
    )
    return getApiData(response)
  },

  async update(id: number, payload: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
