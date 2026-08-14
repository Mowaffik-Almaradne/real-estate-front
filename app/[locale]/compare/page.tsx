"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Card } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { useCompare } from "src/modules/compare"
import { ComparisonHeader } from "src/modules/compare/ComparisonHeader"
import { ComparisonTable } from "src/modules/compare/ComparisonTable"
import { ComparisonEmpty } from "src/modules/compare/ComparisonEmpty"
import { propertyService } from "src/modules/properties/services/propertyService"
import type { PropertyDto } from "@/types/dto"

export default function ComparePage() {
  const t = useTranslations("compare")
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? "en"
  const { ids, isHydrated, clear } = useCompare()
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    if (ids.length === 0) {
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

  const showEmpty = isHydrated && ids.length === 0

  return (
    <DashboardLayout title={t("title")}>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: ids.length })}
          </p>
        </header>

        {showEmpty ? (
          <ComparisonEmpty locale={locale} />
        ) : (
          <div className="space-y-6">
            <ComparisonHeader
              properties={properties}
              locale={locale}
              loading={loading}
            />
            {!loading && properties.length > 0 && (
              <Card className="overflow-hidden">
                <ComparisonTable properties={properties} />
              </Card>
            )}
            {properties.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    clear()
                    toast.success(t("cleared"))
                  }}
                  className="text-sm text-muted-foreground hover:text-destructive underline-offset-4 hover:underline"
                >
                  {t("clearAll")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}