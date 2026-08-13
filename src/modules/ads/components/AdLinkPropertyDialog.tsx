"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Search, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"

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

export function AdLinkPropertyDialog({
  open,
  onOpenChange,
  currentPropertyId,
  onConfirm,
}: AdLinkPropertyDialogProps) {
  const { t } = useAdsTranslations()
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<PropertyOption[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedId(currentPropertyId ?? null)
    setSearch("")
    setItems([])
  }, [open, currentPropertyId])

  useEffect(() => {
    if (!open) return
    const handle = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        try {
          const result = await fetchProperties(search, 1)
          setItems(result.data)
        } catch {
          setItems([])
        } finally {
          setLoading(false)
        }
      })()
    }, 250)
    return () => window.clearTimeout(handle)
  }, [open, search])

  const sortedItems = useMemo(() => items, [items])

  const handleSubmit = async () => {
    if (selectedId == null) return
    setSubmitting(true)
    try {
      await onConfirm(selectedId)
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

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ads.linkProperty.placeholder")}
            className="pl-8"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-md border border-border">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t("ads.linkProperty.noneFound")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sortedItems.map((property) => {
                const isSelected = property.id === selectedId
                return (
                  <li key={property.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(property.id)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-accent ${
                        isSelected ? "bg-accent" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{property.name}</p>
                        {property.city?.name && (
                          <p className="truncate text-xs text-muted-foreground">
                            {property.city.name}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-xs font-medium text-primary">
                          {t("common.selected")}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {selectedId != null && (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <span className="truncate">
              {sortedItems.find((item) => item.id === selectedId)?.name ??
                `#${selectedId}`}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedId(null)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={selectedId == null || submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("ads.linkProperty.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
