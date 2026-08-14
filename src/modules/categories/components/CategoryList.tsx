"use client"

import { useMemo } from "react"
import { ChevronRight, Edit, FolderPlus, MoreHorizontal, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  CATEGORY_TYPES,
  type Category,
  type CategoryTreeNode,
} from "../types"
import { useCategoriesTranslations } from "../locales/useCategoriesTranslations"

interface CategoryListProps {
  categories: Category[]
  tree: CategoryTreeNode[]
  loading: boolean
  error: string | null
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  onAddChild?: (parent: Category) => void
}

export function CategoryList({
  categories,
  tree,
  loading,
  error,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryListProps) {
  const { t } = useCategoriesTranslations()

  const typeLabel = useMemo(
    () => ({
      property: t("typeProperty"),
      car: t("typeCar"),
    }),
    [t]
  )

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </CardContent>
      </Card>
    )
  }

  const groupedByType = CATEGORY_TYPES.map((type) => ({
    type,
    items: categories.filter((c) => c.type === type),
  }))

  return (
    <div className="space-y-6" data-testid="categories-list">
      {groupedByType.map((group) => (
        <section key={group.type} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{typeLabel[group.type]}</h2>
            <Badge variant="outline">{group.items.length}</Badge>
          </div>
          {group.items.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {t("empty")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {group.items
                .filter((c) => (c.parent_id ?? null) === null)
                .map((root) => (
                  <CategoryRow
                    key={root.id}
                    category={root}
                    tree={tree}
                    depth={0}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                  />
                ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  tree: CategoryTreeNode[]
  depth: number
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  onAddChild?: (parent: Category) => void
}

function findNode(
  tree: CategoryTreeNode[],
  id: number
): CategoryTreeNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return undefined
}

function CategoryRow({
  category,
  tree,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryRowProps) {
  const { t } = useCategoriesTranslations()
  const node = findNode(tree, category.id)
  const children = node?.children ?? []

  return (
    <div className="space-y-2">
      <Card
        className="transition-colors hover:bg-muted/40"
        data-testid={`category-row-${category.id}`}
      >
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {depth > 0 && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <p className="truncate text-sm font-semibold">{category.name}</p>
              {category.is_protected && (
                <Badge variant="outline">
                  {t("form.parentLabel") === "Parent category (optional)"
                    ? "Protected"
                    : "محمي"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("columns.type")}: {category.type === "property" ? t("typeProperty") : t("typeCar")}
              {typeof category.properties_count === "number"
                ? ` · ${category.properties_count}`
                : ""}
            </p>
          </div>
          {onAddChild && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onAddChild(category)}
              aria-label={t("actions.addChild")}
              data-testid={`category-add-child-${category.id}`}
            >
              <FolderPlus className="size-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(category)}
              aria-label={t("actions.edit")}
              data-testid={`category-edit-${category.id}`}
            >
              <Edit className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(category)}
              aria-label={t("actions.delete")}
              data-testid={`category-delete-${category.id}`}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </CardContent>
      </Card>
      {children.length > 0 && (
        <div className="ml-4 space-y-2 border-l border-border/40 pl-4">
          {children.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              tree={tree}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}
