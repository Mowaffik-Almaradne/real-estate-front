"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CATEGORY_TYPES, type Category } from "../types"
import { CATEGORY_NAME_MAX } from "../types"
import { useCategoriesTranslations } from "../locales/useCategoriesTranslations"
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryValues,
  type UpdateCategoryValues,
} from "../schemas"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  editing?: Category | null
  defaultParentId?: number | null
  defaultType?: "property" | "car"
  availableParents: Category[]
  onSubmit: (
    payload: CreateCategoryValues | UpdateCategoryValues
  ) => Promise<unknown>
}

const NONE_PARENT_VALUE = "__none__"

function buildInitial(
  editing?: Category | null,
  defaultParentId?: number | null
): {
  name: string
  type: "property" | "car"
  parentId: string
} {
  return {
    name: editing?.name ?? "",
    type: (editing?.type as "property" | "car") ?? "property",
    parentId:
      editing?.parent_id != null
        ? String(editing.parent_id)
        : defaultParentId != null
          ? String(defaultParentId)
          : NONE_PARENT_VALUE,
  }
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editing,
  defaultParentId,
  defaultType,
  availableParents,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useCategoriesTranslations()
  const isEdit = Boolean(editing?.id)
  const [state, setState] = useState(() =>
    buildInitial(editing, defaultParentId)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const next = buildInitial(editing, defaultParentId)
    if (!isEdit && defaultType) {
      next.type = defaultType
    }
    queueMicrotask(() => {
      setState(next)
      setErrors({})
    })
  }, [open, editing, defaultParentId, defaultType, isEdit])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!state.name.trim()) {
      next.name = t("form.validation.nameRequired")
    } else if (state.name.length > CATEGORY_NAME_MAX) {
      next.name = t("form.validation.nameTooLong")
    }
    if (!state.type) {
      next.type = t("form.validation.typeRequired")
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const parentId =
        state.parentId === NONE_PARENT_VALUE || state.parentId === ""
          ? null
          : Number(state.parentId)
      const payload: Record<string, unknown> = {
        name: state.name.trim(),
        type: state.type,
        parent_id: parentId,
      }
      await onSubmit(payload as CreateCategoryValues | UpdateCategoryValues)
      onOpenChange(false)
    } catch (err: unknown) {
      const apiError = err as {
        errors?: Record<string, string[]>
        message?: string
      }
      if (apiError && typeof apiError === "object" && apiError.errors) {
        const mapped: Record<string, string> = {}
        for (const [key, value] of Object.entries(apiError.errors)) {
          if (Array.isArray(value) && value.length > 0) {
            mapped[key] = String(value[0])
          }
        }
        setErrors(mapped)
      } else if (err instanceof Error) {
        setErrors({ _form: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editCategory") : t("newCategory")}
          </DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">{t("form.nameLabel")}</Label>
            <Input
              id="category-name"
              value={state.name}
              onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
              placeholder={t("form.namePlaceholder")}
              maxLength={CATEGORY_NAME_MAX}
              aria-invalid={Boolean(errors.name)}
              data-testid="category-name-input"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-type">{t("form.typeLabel")}</Label>
            <Select
              value={state.type}
              onValueChange={(value) =>
                setState((p) => ({
                  ...p,
                  type: value as "property" | "car",
                }))
              }
              disabled={isEdit}
            >
              <SelectTrigger id="category-type" data-testid="category-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === "property" ? t("typeProperty") : t("typeCar")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-parent">{t("form.parentLabel")}</Label>
            <Select
              value={state.parentId}
              onValueChange={(value) =>
                setState((p) => ({ ...p, parentId: value }))
              }
            >
              <SelectTrigger id="category-parent" data-testid="category-parent-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_PARENT_VALUE}>
                  {t("form.parentNone")}
                </SelectItem>
                {availableParents
                  .filter((p) => !isEdit || p.id !== editing?.id)
                  .map((parent) => (
                    <SelectItem key={parent.id} value={String(parent.id)}>
                      {parent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {errors._form && (
            <p className="text-xs text-destructive">{errors._form}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="category-submit"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? t("form.saveUpdate") : t("form.saveCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { createCategorySchema, updateCategorySchema }
