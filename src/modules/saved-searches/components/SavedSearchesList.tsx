"use client"

import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { BookmarkPlus, RotateCw } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Skeleton } from "components/ui/skeleton"

import { SavedSearchCard } from "./SavedSearchCard"
import { useSavedSearches } from "../hooks/useSavedSearches"
import { filtersToQuery, type SavedSearch } from "../types"

interface SavedSearchesListProps {
  onCreateClick?: () => void
  refreshKey?: number
}

function CardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-1/2" />
      </CardContent>
    </Card>
  )
}

export function SavedSearchesList({ onCreateClick, refreshKey = 0 }: SavedSearchesListProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations("savedSearches")
  const {
    searches,
    isLoading,
    error,
    remove,
    toggleAlert,
    setAlertFrequency,
    refresh,
  } = useSavedSearches(refreshKey)

  function handleApply(item: SavedSearch) {
    const qs = filtersToQuery(item.filters)
    const target = `/${locale}/properties${qs ? `?${qs}` : ""}`
    router.push(target)
  }

  if (isLoading && searches.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RotateCw className="size-4" aria-hidden />
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (searches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <BookmarkPlus className="size-7 text-primary" aria-hidden />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("emptyTitle")}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
          {onCreateClick && (
            <Button onClick={onCreateClick} variant="outline" size="sm">
              <BookmarkPlus className="size-4" aria-hidden />
              {t("saveCurrentFilters")}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="saved-searches-list">
      {searches.map((item) => (
        <SavedSearchCard
          key={item.id}
          savedSearch={item}
          onApply={handleApply}
          onToggleAlert={toggleAlert}
          onDelete={(id) => remove(id).then(() => undefined)}
          onChangeFrequency={setAlertFrequency}
        />
      ))}
    </div>
  )
}