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
} from "components/ui/dialog"
import { Button } from "components/ui/button"

import { AsyncSelect } from "@/components/ui/async-select"
import { apiClient, getApiData, type ApiResponse } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"
import { useAdsTranslations } from "../locales/useAdsTranslations"

interface PropertyOption {
  id: number
  name: string
  city?: { id: number; name: string } | null
  main_image?: string | null
}

interface AdLinkPropertyDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  currentPropertyId?: number | null
  onConfirm: (propertyId: number) => Promise<unknown>
}

const PAGE_SIZE = 25

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

async function fetchProperties(
  search: string,
  page: number
): Promise<{ data: PropertyOption[]; pagination?: ApiPagination }> {
  const response = await apiClient.get<ApiResponse<PropertyOption[]>>(
    "/dashboard/properties",
    { params: { search, page, perPage: PAGE_SIZE } }
  )
  const data = getApiData(response) ?? []
  const envelope = asRecord(response.data) ?? {}
  const pagination = (envelope.pagination ?? envelope.meta) as ApiPagination | undefined
  return { data, pagination }
}

function deriveHasMore(
  data: PropertyOption[],
  pagination: ApiPagination | undefined,
  page: number
): boolean {
  if (pagination) {
    if (typeof pagination.last_page === "number") {
      return page < pagination.last_page
    }
    if (typeof pagination.total === "number" && typeof pagination.per_page === "number") {
      const lastPage = Math.max(1, Math.ceil(pagination.total / pagination.per_page))
      return page < lastPage
    }
  }
  return data.length >= PAGE_SIZE
}

export function AdLinkPropertyDialog({
  open,
  onOpenChange,
  currentPropertyId,
  onConfirm,
}: AdLinkPropertyDialogProps) {
  const { t } = useAdsTranslations()
  const [selected, setSelected] = useState<PropertyOption | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    Promise.resolve().then(() => setSelected(null))
  }, [open, currentPropertyId])

  const handleSubmit = async () => {
    if (selected == null) return
    setSubmitting(true)
    try {
      await onConfirm(selected.id)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ads.linkProperty.title")}</DialogTitle>
          <DialogDescription>
            {t("ads.linkProperty.description")}
          </DialogDescription>
        </DialogHeader>

        <AsyncSelect<PropertyOption>
          value={selected}
          onChange={setSelected}
          fetcher={async ({ search, page }) => {
            const result = await fetchProperties(search, page)
            return {
              items: result.data,
              hasMore: deriveHasMore(result.data, result.pagination, page),
              total: result.pagination?.total,
            }
          }}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
          placeholder={t("ads.linkProperty.placeholder")}
          searchPlaceholder={t("ads.linkProperty.placeholder")}
          emptyMessage={t("ads.linkProperty.noneFound")}
          errorMessage={t("ads.linkProperty.noneFound")}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={selected == null || submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("ads.linkProperty.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
