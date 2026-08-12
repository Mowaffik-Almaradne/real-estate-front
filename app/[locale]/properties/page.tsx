"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { Filter, Loader2, Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { propertyService } from "src/modules/properties/services/propertyService"
import {
  PropertyFilters,
} from "src/modules/properties/components/PropertyFilters"
import {
  SearchAutocomplete,
  AdvancedFilters,
  EMPTY_ADVANCED_FILTERS,
} from "src/modules/search"
import { PropertyGridCard } from "src/modules/properties/components/PropertyGridCard"
import { PropertyListRow, type PropertyListItem } from "src/modules/properties/components/PropertyListRow"
import { ViewModeToggle, type ViewMode } from "src/modules/properties/components/ViewModeToggle"
import { useFilterUrlState } from "src/modules/properties/hooks/useFilterUrlState"
import {
  ActiveFilterChips,
  ShareButton,
  type ActiveFilterChip,
} from "src/modules/properties/components/FilterExtras"
import { useDebounce } from "@/hooks"
import type { PropertyDto } from "@/types/dto"
import { filterToParams, type PropertyFilters as PropertyFiltersApi } from "src/modules/properties/services/propertyService"
import { cn } from "@/lib/utils"
import { SaveSearchDialog } from "src/modules/saved-searches/components/SaveSearchDialog"
import { useCurrentSearchCandidate } from "src/modules/saved-searches/hooks/useCurrentSearchCandidate"

const PER_PAGE = 12

const PropertyCarousel = dynamic(
  () => import("components/properties/PropertyCarousel").then((m) => m.PropertyCarousel),
  {
    loading: () => <div className="h-72 animate-pulse rounded-lg bg-muted" />,
    ssr: false,
  }
)

const PropertyMapView = dynamic(
  () =>
    import("src/modules/properties/components/PropertyMapView").then((m) => m.PropertyMapView),
  {
    loading: () => <div className="h-[60vh] w-full animate-pulse rounded-lg bg-muted" />,
    ssr: false,
  }
)

function PublicPropertiesPageInner() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? "en"
  const tProperty = useTranslations("property")
  const tCommon = useTranslations("common")
  const tHome = useTranslations("home")
  const { filters, advanced, setFilters, setAdvanced, reset: resetFilters, hasActiveFilters } = useFilterUrlState()
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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const debouncedFilters = useDebounce(filters, 250)
  const debouncedSort = useDebounce(filters.sort, 250)
  const { filters: candidateFilters } = useCurrentSearchCandidate()

  const buildApiFilters = useCallback(
    (page: number): PropertyFiltersApi => {
      const [sortBy, sortOrder] = debouncedSort.split(":") as [
        string,
        "asc" | "desc",
      ]
      return filterToParams({
        search: debouncedFilters.search || undefined,
        property_type: debouncedFilters.property_type || undefined,
        type_of_contract: debouncedFilters.type_of_contract || undefined,
        country_id: debouncedFilters.country_id ?? undefined,
        city_id: debouncedFilters.city_id ?? undefined,
        rooms_min: debouncedFilters.rooms
          ? Number(debouncedFilters.rooms)
          : undefined,
        bathrooms_min: debouncedFilters.bathrooms
          ? Number(debouncedFilters.bathrooms)
          : undefined,
        price_min: debouncedFilters.min_price
          ? Number(debouncedFilters.min_price)
          : undefined,
        price_max: debouncedFilters.max_price
          ? Number(debouncedFilters.max_price)
          : undefined,
        area_min: advanced.area_min ? Number(advanced.area_min) : undefined,
        area_max: advanced.area_max ? Number(advanced.area_max) : undefined,
        page,
        perPage: PER_PAGE,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
    },
    [debouncedFilters, debouncedSort, advanced]
  )

  const fetchFeatured = useCallback(async () => {
    try {
      return await propertyService.getRandomProperties()
    } catch {
      return []
    }
  }, [])

  const isFetchingPropertiesRef = useRef(false)

  const fetchProperties = useCallback(
    async (page: number, append: boolean) => {
      if (isFetchingPropertiesRef.current) return
      isFetchingPropertiesRef.current = true
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const response = await propertyService.getProperties(buildApiFilters(page))
        setData((current) =>
          append ? [...current, ...response.data] : response.data
        )
        setPagination(response.pagination)
      } catch (error) {
        console.error("Failed to fetch properties:", error)
        toast.error(tProperty("noResults"))
      } finally {
        setLoading(false)
        setLoadingMore(false)
        isFetchingPropertiesRef.current = false
      }
    },
    [buildApiFilters, tProperty]
  )

  const fetchPropertiesRef = useRef(fetchProperties)
  useEffect(() => {
    fetchPropertiesRef.current = fetchProperties
  })

  const [featured, setFeatured] = useState<PropertyDto[]>([])

  useEffect(() => {
    let active = true
    void fetchFeatured().then((data) => {
      if (active) setFeatured(data)
    })
    return () => {
      active = false
    }
  }, [fetchFeatured])

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

  const lastFetchKeyRef = useRef<string | null>(null)
  useEffect(() => {
    const fetchKey = JSON.stringify([debouncedFilters, debouncedSort, advanced])
    if (fetchKey === lastFetchKeyRef.current) return
    lastFetchKeyRef.current = fetchKey
    const handle = window.setTimeout(() => {
      void fetchPropertiesRef.current(1, false)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [debouncedFilters, debouncedSort, advanced])

  const chips = useMemo<ActiveFilterChip[]>(() => {
    const out: ActiveFilterChip[] = []
    if (debouncedFilters.search) {
      out.push({
        key: "search",
        label: `"${debouncedFilters.search}"`,
        onRemove: () => setFilters({ ...filters, search: "" }),
      })
    }
    if (debouncedFilters.property_type) {
      out.push({
        key: "property_type",
        label: tProperty(`filters.type.${debouncedFilters.property_type}` as never),
        onRemove: () => setFilters({ ...filters, property_type: "" }),
      })
    }
    if (debouncedFilters.type_of_contract) {
      out.push({
        key: "type_of_contract",
        label: tProperty(
          `filters.contractOption.${debouncedFilters.type_of_contract}` as never
        ),
        onRemove: () => setFilters({ ...filters, type_of_contract: "" }),
      })
    }
    if (debouncedFilters.rooms) {
      out.push({
        key: "rooms",
        label: `${tProperty("filters.beds")} ≥ ${debouncedFilters.rooms}`,
        onRemove: () => setFilters({ ...filters, rooms: "" }),
      })
    }
    if (debouncedFilters.bathrooms) {
      out.push({
        key: "bathrooms",
        label: `${tProperty("filters.baths")} ≥ ${debouncedFilters.bathrooms}`,
        onRemove: () => setFilters({ ...filters, bathrooms: "" }),
      })
    }
    if (debouncedFilters.min_price || debouncedFilters.max_price) {
      const lo = debouncedFilters.min_price || "0"
      const hi = debouncedFilters.max_price || "∞"
      out.push({
        key: "price",
        label: `${lo} – ${hi}`,
        onRemove: () => setFilters({ ...filters, min_price: "", max_price: "" }),
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, filters, tProperty])

  const loadingMoreRef = useRef(loadingMore)
  const paginationRef = useRef(pagination)
  useEffect(() => {
    loadingMoreRef.current = loadingMore
    paginationRef.current = pagination
  })

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMoreRef.current &&
          paginationRef.current.current_page < paginationRef.current.last_page
        ) {
          void fetchPropertiesRef.current(paginationRef.current.current_page + 1, true)
        }
      },
      { threshold: 1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [])

  const headerActions = (
    <div className="flex items-center gap-2">
      <ViewModeToggle value={view} onChange={setView} className="lg:hidden" />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setFiltersOpen(true)}
        className="lg:hidden"
      >
        <Filter className="size-4" />
        {tCommon("search")}
      </Button>
    </div>
  )

  return (
    <DashboardLayout title={tProperty("title")} actions={headerActions}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block space-y-4">
          <Card>
            <CardContent className="p-4">
              <PropertyFilters value={filters} onChange={setFilters} />
            </CardContent>
          </Card>
          <AdvancedFilters
            values={advanced}
            onChange={setAdvanced}
            onReset={() => setAdvanced(EMPTY_ADVANCED_FILTERS)}
          />
        </aside>

        <div className="space-y-6">
          <SearchAutocomplete
            locale={locale}
            initialQuery={filters.search}
            basePath={`/${locale}/properties`}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{tProperty("title")}</h1>
              <p className="text-sm text-muted-foreground">
                {loading && data.length === 0
                  ? `${tCommon("loading").replace("...", "")}...`
                  : `${pagination.total} ${pagination.total === 1 ? tProperty("title").slice(0, -1) : tProperty("title").toLowerCase()}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSaveDialogOpen(true)}
                disabled={!hasActiveFilters}
                data-testid="open-save-search-dialog-properties"
              >
                {tProperty("filters.saveSearch")}
              </Button>
              <ShareButton />
              <ViewModeToggle value={view} onChange={setView} />
              <Button onClick={() => router.push("/properties/create")} className="rounded-lg">
                <Plus className="size-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {tProperty("create")}
              </Button>
            </div>
          </div>

          <ActiveFilterChips
            chips={chips}
            onClearAll={resetFilters}
            clearAllLabel={tProperty("filters.clearAll")}
          />

          <PropertyCarousel
            properties={featured}
            title={tHome("cta")}
            loading={featured.length === 0}
            error={null}
            onRetry={() => {
              void fetchFeatured().then((data) => setFeatured(data))
            }}
          />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{tProperty("browse")}</h2>
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
            ) : data.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-sm text-muted-foreground">
                  <p className="font-medium">{tProperty("noResults")}</p>
                </CardContent>
              </Card>
            ) : view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((property) => (
                  <PropertyGridCard key={property.id} property={property} />
                ))}
              </div>
            ) : view === "list" ? (
              <div className="space-y-2">
                {data.map((property) => (
                  <PropertyListRow key={property.id} property={toListItem(property)} />
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
      </div>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-full max-w-sm overflow-y-auto bg-background p-4 shadow-xl rtl:left-auto rtl:right-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{tCommon("search")}</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label={tCommon("close")}
              >
                <X className="size-4" />
              </Button>
            </div>
            <PropertyFilters value={filters} onChange={setFilters} />
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => resetFilters()}
              >
                {tProperty("filters.clearAll")}
              </Button>
            )}
          </div>
        </div>
      )}

      <SaveSearchDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        filters={candidateFilters}
      />
    </DashboardLayout>
  )
}

export default function PublicPropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PublicPropertiesPageInner />
    </Suspense>
  )
}
