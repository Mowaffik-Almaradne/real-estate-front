"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Heart, Loader2, SearchX } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { propertyService } from "src/modules/properties/services/propertyService"
import {
  PropertyFilters,
} from "src/modules/properties/components/PropertyFilters"
import { PropertyGridCard } from "src/modules/properties/components/PropertyGridCard"
import { PropertyListRow, type PropertyListItem } from "src/modules/properties/components/PropertyListRow"
import { ViewModeToggle, type ViewMode } from "src/modules/properties/components/ViewModeToggle"
import { useFilterUrlState } from "src/modules/properties/hooks/useFilterUrlState"
import { useDebounce } from "@/hooks"
import { useFavorites } from "src/modules/favorites/FavoritesProvider"
import type { PropertyDto } from "@/types/dto"
import { filterToParams, type PropertyFilters as PropertyFiltersApi } from "src/modules/properties/services/propertyService"
import { cn } from "@/lib/utils"

const PER_PAGE = 12

const PropertyMapView = dynamic(
  () =>
    import("src/modules/properties/components/PropertyMapView").then((m) => m.PropertyMapView),
  {
    loading: () => <div className="h-[60vh] w-full animate-pulse rounded-lg bg-muted" />,
    ssr: false,
  }
)

function FavoritesPageInner() {
  const router = useRouter()
  const tFav = useTranslations("property.favorites")
  const tProperty = useTranslations("property")
  const tCommon = useTranslations("common")
  const { filters, setFilters, reset: resetFilters, hasActiveFilters } = useFilterUrlState()
  const favorites = useFavorites()
  const [view, setView] = useState<ViewMode>("grid")
  const [data, setData] = useState<PropertyDto[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: PER_PAGE,
    current_page: 1,
    last_page: 1,
    from: null as number | null,
    to: null as number | null,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const debouncedFilters = useDebounce(filters, 250)
  const debouncedSort = useDebounce(filters.sort, 250)

  const buildApiFilters = useCallback(
    (page: number): PropertyFiltersApi & { ids: number[] } => {
      const [sortBy, sortOrder] = debouncedSort.split(":") as [string, "asc" | "desc"]
      return {
        ...filterToParams({
          search: debouncedFilters.search || undefined,
          property_type: debouncedFilters.property_type || undefined,
          type_of_contract: debouncedFilters.type_of_contract || undefined,
          country_id: debouncedFilters.country_id ?? undefined,
          city_id: debouncedFilters.city_id ?? undefined,
          rooms_min: debouncedFilters.rooms ? Number(debouncedFilters.rooms) : undefined,
          bathrooms_min: debouncedFilters.bathrooms
            ? Number(debouncedFilters.bathrooms)
            : undefined,
          price_min: debouncedFilters.min_price
            ? Number(debouncedFilters.min_price)
            : undefined,
          price_max: debouncedFilters.max_price
            ? Number(debouncedFilters.max_price)
            : undefined,
          page,
          perPage: PER_PAGE,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        ids: Array.from(favorites.ids),
        page,
        perPage: PER_PAGE,
      }
    },
    [debouncedFilters, debouncedSort, favorites.ids]
  )

  const fetchFavorites = useCallback(
    async (page: number, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const response = await propertyService.getFavorites(buildApiFilters(page))
        setData((current) => (append ? [...current, ...response.data] : response.data))
        setPagination(response.pagination)
      } catch (error) {
        console.error("Failed to fetch favorites:", error)
        toast.error(tFav("loadError"))
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [buildApiFilters, tFav]
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchFavorites(1, false)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchFavorites])

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !loadingMore &&
          pagination.current_page < pagination.last_page
        ) {
          void fetchFavorites(pagination.current_page + 1, true)
        }
      },
      { threshold: 1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchFavorites, loadingMore, pagination.current_page, pagination.last_page])

  const toListItem = (property: PropertyDto): PropertyListItem => ({
    ...property,
    main_image: property.main_image,
    main_image_thumb: property.main_image_thumb,
    area: String(property.area),
    publisher: {
      id: property.publisher.id,
      name: property.publisher.name,
      is_verified: property.publisher.is_verified,
      publisher_type: property.publisher.publisher_type,
    },
  })

  const handleRemove = useCallback(
    (propertyId: number, propertyName: string) => {
      const previous = data
      setData((current) => current.filter((p) => p.id !== propertyId))
      favorites.remove(propertyId)
      setPagination((p) => ({
        ...p,
        total: Math.max(0, p.total - 1),
      }))
      toast(tFav("removed"), {
        description: propertyName,
        action: {
          label: tFav("undo"),
          onClick: () => {
            setData(previous)
            favorites.add(propertyId)
            setPagination((p) => ({
              ...p,
              total: p.total + 1,
            }))
          },
        },
      })
    },
    [data, favorites, tFav]
  )

  const headerActions = (
    <ViewModeToggle value={view} onChange={setView} className="lg:hidden" />
  )

  const isEmpty = !loading && data.length === 0
  const nofavoritesAtAll = isEmpty && !hasActiveFilters && favorites.count === 0

  return (
    <DashboardLayout title={tFav("title")} actions={headerActions}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tFav("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {tFav("subtitle")} · {tFav("count", { count: favorites.count })}
            </p>
          </div>
          <ViewModeToggle value={view} onChange={setView} className="hidden lg:inline-flex" />
        </div>

        {nofavoritesAtAll ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Heart className="size-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{tFav("empty")}</p>
                <p className="text-sm text-muted-foreground">{tFav("emptyHint")}</p>
              </div>
              <Button onClick={() => router.push("/properties")} className="rounded-lg">
                {tFav("emptyCta")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <Card>
                <CardContent className="p-4">
                  <PropertyFilters value={filters} onChange={setFilters} />
                </CardContent>
              </Card>
            </aside>

            <div className="space-y-4">
              {loading && data.length === 0 ? (
                <div
                  className={cn(
                    view === "grid"
                      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      : "space-y-2"
                  )}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "animate-pulse rounded-lg bg-muted",
                        view === "grid" ? "h-72" : "h-24"
                      )}
                    />
                  ))}
                </div>
              ) : isEmpty ? (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
                    <SearchX className="size-6" />
                    <p className="font-medium">{tProperty("noResults")}</p>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      {tProperty("filters.clear")}
                    </Button>
                  </CardContent>
                </Card>
              ) : view === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.map((property) => (
                    <FavoriteGridCard
                      key={property.id}
                      property={property}
                      onRemove={() => handleRemove(property.id, property.name)}
                    />
                  ))}
                </div>
              ) : view === "list" ? (
                <div className="space-y-2">
                  {data.map((property) => (
                    <PropertyListRow
                      key={property.id}
                      property={toListItem(property)}
                    />
                  ))}
                </div>
              ) : (
                <PropertyMapView properties={data} />
              )}

              <div
                ref={loaderRef}
                className="flex items-center justify-center py-6 text-sm text-muted-foreground"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {tCommon("loading")}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function FavoriteGridCard({
  property,
  onRemove,
}: {
  property: PropertyDto
  onRemove: () => void
}) {
  return (
    <div className="relative">
      <PropertyGridCard property={property} />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${property.name} from favorites`}
        className="absolute end-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur-md transition-all hover:bg-red-600"
      >
        <Heart className="size-4 fill-current" />
      </button>
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesPageInner />
    </Suspense>
  )
}
