"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { categoryService } from "../services/categoryService"
import type {
  Category,
  CategoryFilters,
  CategoryTreeNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types"

export interface UseCategoriesResult {
  categories: Category[]
  tree: CategoryTreeNode[]
  loading: boolean
  error: string | null
  filters: CategoryFilters
  setFilters: (next: CategoryFilters) => void
  refresh: () => Promise<void>
  create: (payload: CreateCategoryRequest) => Promise<Category>
  update: (id: number, payload: UpdateCategoryRequest) => Promise<Category>
  remove: (id: number) => Promise<boolean>
}

export function useCategories(initial: CategoryFilters = {}): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<CategoryFilters>(initial)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await categoryService.listAdmin(filters)
      setCategories(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load categories"
      setError(message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const setFilters = useCallback((next: CategoryFilters) => {
    setFiltersState(next)
  }, [])

  const create = useCallback(
    async (payload: CreateCategoryRequest): Promise<Category> => {
      const created = await categoryService.create(payload)
      setCategories((prev) => [...prev, created])
      return created
    },
    []
  )

  const update = useCallback(
    async (id: number, payload: UpdateCategoryRequest): Promise<Category> => {
      const updated = await categoryService.update(id, payload)
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return updated
    },
    []
  )

  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      await categoryService.remove(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      return true
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to delete category"
      setError(message)
      return false
    }
  }, [])

  const tree = buildTree(categories, null)

  return {
    categories,
    tree,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    create,
    update,
    remove,
  }
}

function buildTree(
  nodes: Category[],
  parentId: number | null
): CategoryTreeNode[] {
  return nodes
    .filter((node) => (node.parent_id ?? null) === parentId)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }))
}
