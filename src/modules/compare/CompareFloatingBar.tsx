"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { GitCompareArrows, X, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card } from "components/ui/card"
import { useCompare } from "./CompareProvider"
import { propertyService } from "src/modules/properties/services/propertyService"
import type { PropertyDto } from "@/types/dto"

interface CompareFloatingBarProps {
  locale: string
}

export function CompareFloatingBar({ locale }: CompareFloatingBarProps) {
  const t = useTranslations("compare")
  const router = useRouter()
  const { ids, isHydrated, remove, clear } = useCompare()
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isHydrated || ids.length === 0) {
      void Promise.resolve().then(() => setProperties([]))
      return
    }
    let active = true
    void (async () => {
      try {
        await Promise.resolve()
        if (active) setLoading(true)
        const results: PropertyDto[] = []
        for (const id of ids) {
          try {
            const data = await propertyService.getPropertyById(id)
            if (active) results.push(data)
          } catch (err) {
            console.error("Failed to load compare property", id, err)
          }
        }
        if (active) setProperties(results)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [ids, isHydrated])

  const visible = isHydrated && ids.length > 0

  const thumbMap = useMemo(() => {
    const m = new Map<number, PropertyDto>()
    properties.forEach((p) => m.set(p.id, p))
    return m
  }, [properties])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label={t("barLabel")}
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4 w-full max-w-2xl"
    >
      <Card className="flex items-center gap-3 p-3 shadow-2xl border-primary/30 backdrop-blur">
        <div className="flex items-center gap-2 shrink-0">
          <GitCompareArrows className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold">
            {t("count", { count: ids.length })}
          </span>
        </div>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {loading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
          {ids.map((id) => {
            const property = thumbMap.get(id)
            return (
              <div
                key={id}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs shrink-0"
              >
                <span className="max-w-[120px] truncate">
                  {property?.name ?? `#${id}`}
                </span>
                <button
                  onClick={() => remove(id)}
                  aria-label={t("removeFromCompare")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              clear()
              toast.success(t("cleared"))
            }}
            aria-label={t("clearAll")}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/${locale}/compare`)}
            disabled={ids.length < 2}
          >
            {t("viewComparison")}
          </Button>
        </div>
      </Card>
    </div>
  )
}