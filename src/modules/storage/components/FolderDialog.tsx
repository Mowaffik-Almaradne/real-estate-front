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

import { FOLDER_NAME_MAX, type Folder } from "../types"
import { useStorageTranslations } from "../locales/useStorageTranslations"
import {
  createFolderSchema,
  renameFolderSchema,
  type CreateFolderValues,
  type RenameFolderValues,
} from "../schemas"

interface FolderDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  parentFolder?: Folder | null
  editing?: Folder | null
  availableParents: Folder[]
  onSubmit: (
    payload: CreateFolderValues | RenameFolderValues
  ) => Promise<unknown>
}

const NONE_PARENT_VALUE = "__none__"

export function FolderDialog({
  open,
  onOpenChange,
  parentFolder,
  editing,
  availableParents,
  onSubmit,
}: FolderDialogProps) {
  const { t } = useStorageTranslations()
  const isEdit = Boolean(editing?.id)
  const [name, setName] = useState("")
  const [parentId, setParentId] = useState<string>(NONE_PARENT_VALUE)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const initialName = editing?.name ?? ""
    const initialParent =
      editing?.parent_id != null
        ? String(editing.parent_id)
        : parentFolder?.id != null
          ? String(parentFolder.id)
          : NONE_PARENT_VALUE
    queueMicrotask(() => {
      setName(initialName)
      setParentId(initialParent)
      setErrors({})
    })
  }, [open, editing, parentFolder])

  const handleSubmit = async () => {
    const next: Record<string, string> = {}
    if (!name.trim()) {
      next.name = t("folderDialog.validation.nameRequired")
    } else if (name.length > FOLDER_NAME_MAX) {
      next.name = t("folderDialog.validation.nameTooLong")
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const resolvedParent =
        parentId === NONE_PARENT_VALUE ? null : Number(parentId)
      const payload = isEdit
        ? { name: name.trim() }
        : {
            name: name.trim(),
            parent_id: resolvedParent,
          }
      await onSubmit(payload as CreateFolderValues | RenameFolderValues)
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
          <DialogTitle>{t("folderDialog.title")}</DialogTitle>
          <DialogDescription>{t("folderDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="folder-name">{t("folderDialog.nameLabel")}</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("folderDialog.namePlaceholder")}
              maxLength={FOLDER_NAME_MAX}
              aria-invalid={Boolean(errors.name)}
              data-testid="folder-name-input"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="folder-parent">{t("folderDialog.parentLabel")}</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="folder-parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PARENT_VALUE}>
                    {t("folderDialog.parentNone")}
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
          )}
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
            data-testid="folder-submit"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? t("folderDialog.saveUpdate") : t("folderDialog.saveCreate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { createFolderSchema, renameFolderSchema }
