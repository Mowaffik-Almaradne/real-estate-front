"use client"

import { useLocale } from "next-intl"
import { AlertCircle, Loader2, Search as SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { formatCurrency } from "@/lib/format"

import { getAiLabel } from "../labels"
import type { AiSearchResponse, AiSearchResultItem } from "../types/dto"

interface AiSearchResultsProps {
  response: AiSearchResponse | null
  loading?: boolean
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value)
    return Number.isNaN(num) ? null : num
  }
  return null
}

function formatScore(value: unknown): string {
  const num = asNumber(value)
  if (num === null) return ""
  if (num <= 1) return `${(num * 100).toFixed(0)}%`
  return num.toFixed(2)
}

export function AiSearchResults({ response, loading = false }: AiSearchResultsProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {label("ai.search.loading")}
        </CardContent>
      </Card>
    )
  }

  if (!response) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          <SearchIcon className="size-8 mx-auto mb-3 text-muted-foreground/60" />
          <p className="font-medium">{label("ai.search.empty.title")}</p>
          <p className="text-xs mt-1">{label("ai.search.empty.description")}</p>
        </CardContent>
      </Card>
    )
  }

  if (response.results.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          <AlertCircle className="size-5 mx-auto mb-2" />
          {label("ai.search.noResults")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{label("ai.search.results.title")}</p>
        <p>{label("ai.search.results.summary", { total: response.total ?? response.results.length })}</p>
      </div>

      <div className="space-y-3">
        {response.results.map((item, index) => (
          <AiSearchResultCard key={String(item.id ?? index)} item={item} />
        ))}
      </div>
    </div>
  )
}

interface AiSearchResultCardProps {
  item: AiSearchResultItem
}

function AiSearchResultCard({ item }: AiSearchResultCardProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const price = asNumber(item.price)
  const score = formatScore(item.score)

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="font-semibold truncate">
              {item.title ?? `Property #${item.property_id ?? item.id}`}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {item.city && <span>{item.city}</span>}
              {item.property_type && <span>{item.property_type}</span>}
              {price !== null && item.currency && (
                <span>{formatCurrency(price, item.currency, locale)}</span>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {item.url}
                </a>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
            )}
          </div>
          {score && (
            <Badge variant="outline" className="shrink-0">
              {label("ai.search.score")}: {score}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
