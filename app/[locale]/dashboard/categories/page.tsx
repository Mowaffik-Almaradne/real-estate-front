"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  CategoryDeleteDialog,
  CategoryFiltersBar,
  CategoryFormDialog,
  CategoryList,
  categoryService,
  useCategories,
  useCategoriesTranslations,
  type Category,
  type CategoryType,
  type CategoryFilters,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "src/modules/categories"

export default function CategoriesPage() {
  const { t } = useCategoriesTranslations()
  const [filters, setFiltersState] = useState<CategoryFilters>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [defaultParent, setDefaultParent] = useState<Category | null>(null)
  const [defaultType, setDefaultType] = useState<CategoryType | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { categories, tree, loading, error, create, update, refresh } =
    useCategories(filters)

  const search = filters.search ?? ""
  const onSearchChange = (next: string) =>
    setFiltersState((prev) => ({ ...prev, search: next || undefined }))
  const onTypeChange = (type: CategoryType | undefined) =>
    setFiltersState((prev) => ({ ...prev, type }))

  const availableParents = useMemo(
    () => categories.filter((c) => c.parent_id == null),
    [categories]
  )

  const handleNew = () => {
    setEditing(null)
    setDefaultParent(null)
    setDefaultType(undefined)
    setFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditing(category)
    setDefaultParent(null)
    setDefaultType(category.type)
    setFormOpen(true)
  }

  const handleAddChild = (parent: Category) => {
    setEditing(null)
    setDefaultParent(parent)
    setDefaultType(parent.type)
    setFormOpen(true)
  }

  const handleSubmit = async (
    payload: CreateCategoryRequest | UpdateCategoryRequest
  ) => {
    if (editing) {
      await update(editing.id, payload as UpdateCategoryRequest)
      toast.success(t("update.success"))
    } else {
      await create(payload as CreateCategoryRequest)
      toast.success(t("create.success"))
    }
  }

  const handleDelete = (category: Category) => {
    setDeleteTarget(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await categoryService.remove(deleteTarget.id)
      toast.success(t("delete.success"))
      setDeleteTarget(null)
      void refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errorLoading")
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button onClick={handleNew} data-testid="categories-new">
            <Plus className="mr-1.5 size-4" />
            {t("newCategory")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.search")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryFiltersBar
              type={filters.type}
              search={search}
              onTypeChange={onTypeChange}
              onSearchChange={onSearchChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CategoryList
              categories={categories}
              tree={tree}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
            />
          </CardContent>
        </Card>
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
            setDefaultParent(null)
            setDefaultType(undefined)
          }
          setFormOpen(open)
        }}
        editing={editing}
        defaultParentId={defaultParent?.id ?? null}
        defaultType={defaultType}
        availableParents={availableParents}
        onSubmit={handleSubmit}
      />

      <CategoryDeleteDialog
        open={Boolean(deleteTarget)}
        submitting={deleting}
        protectedCategory={deleteTarget?.is_protected ?? false}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  )
}
