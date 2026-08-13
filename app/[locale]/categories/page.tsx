"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  CategoryList,
  CATEGORY_TYPES,
  categoryService,
  useCategoriesTranslations,
  type Category,
  type CategoryFilters,
  type CategoryTreeNode,
  type CategoryType,
} from "src/modules/categories"

export default function PublicCategoriesPage() {
  const { t } = useCategoriesTranslations()
  const [filters, setFilters] = useState<CategoryFilters>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await categoryService.listPublic(filters)
      setCategories(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errorLoading")
      setError(message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [filters, t])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const tree = useMemo<CategoryTreeNode[]>(
    () => buildTree(categories, null),
    [categories]
  )

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("typeLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <FilterPill
              label={t("typeAll")}
              active={!filters.type}
              onClick={() => setFilters({})}
            />
            {CATEGORY_TYPES.map((type) => (
              <FilterPill
                key={type}
                label={
                  type === "property" ? t("typeProperty") : t("typeCar")
                }
                active={filters.type === (type as CategoryType)}
                onClick={() => setFilters({ type: type as CategoryType })}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading && categories.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <CategoryList
                categories={categories}
                tree={tree}
                loading={loading}
                error={error}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
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

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-visible:outline-none"
      data-testid={`categories-pill-${label}`}
    >
      <Badge variant={active ? "default" : "outline"}>{label}</Badge>
    </button>
  )
}
