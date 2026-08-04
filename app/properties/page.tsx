"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Filter, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { PropertyCarousel } from "components/properties/PropertyCarousel"
import { apiClient } from "@/lib/apiClient"
import { propertyService } from "src/modules/properties/services/propertyService"
import {
  PropertyFilters,
  EMPTY_FILTERS,
  type PropertyFilterValues,
} from "src/modules/properties/components/PropertyFilters"
import { PropertyGridCard } from "src/modules/properties/components/PropertyGridCard"
import { PropertyListRow, type PropertyListItem } from "src/modules/properties/components/PropertyListRow"
import { ViewModeToggle, type ViewMode } from "src/modules/properties/components/ViewModeToggle"
import { useDebounce } from "@/hooks"
import type { PropertyDto } from "@/types/dto"
import { filterToParams, type PropertyFilters as PropertyFiltersApi } from "src/modules/properties/services/propertyService"
import { cn } from "@/lib/utils"

interface PropertiesResponse {
  data: PropertyDto[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number | null
    to: number | null
  }
}

const PER_PAGE = 12

export default function PublicPropertiesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<PropertyFilterValues>(EMPTY_FILTERS)
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
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const debouncedFilters = useDebounce(filters, 250)
  const debouncedSort = useDebounce(filters.sort, 250)

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
        rooms: debouncedFilters.rooms || undefined,
        bathrooms: debouncedFilters.bathrooms || undefined,
        min_price: debouncedFilters.min_price
          ? Number(debouncedFilters.min_price)
          : undefined,
        max_price: debouncedFilters.max_price
          ? Number(debouncedFilters.max_price)
          : undefined,
        page,
        per_page: PER_PAGE,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
    },
    [debouncedFilters, debouncedSort]
  )

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: PropertyDto[] }>(
        "/public/properties/random"
      )
      return res.data.data ?? []
    } catch {
      return []
    }
  }, [])

  const fetchProperties = useCallback(
    async (page: number, append: boolean) => {
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
        toast.error("Could not load properties")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [buildApiFilters]
  )

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

  useEffect(() => {
    void fetchProperties(1, false)
  }, [fetchProperties])

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          pagination.current_page < pagination.last_page
        ) {
          void fetchProperties(pagination.current_page + 1, true)
        }
      },
      { threshold: 1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchProperties, loadingMore, pagination.current_page, pagination.last_page])

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
        Filters
      </Button>
    </div>
  )

  return (
    <DashboardLayout title="Properties" actions={headerActions}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card>
            <CardContent className="p-4">
              <PropertyFilters value={filters} onChange={setFilters} />
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
              <p className="text-sm text-muted-foreground">
                {loading && data.length === 0
                  ? "Loading properties..."
                  : `${pagination.total} ${pagination.total === 1 ? "property" : "properties"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ViewModeToggle value={view} onChange={setView} />
              <Button onClick={() => router.push("/properties/create")} className="rounded-lg">
                <Plus className="size-4 mr-2" />
                Create Property
              </Button>
            </div>
          </div>

          <PropertyCarousel
            properties={featured}
            title="Featured Properties"
            loading={featured.length === 0}
            error={null}
            onRetry={() => {
              void fetchFeatured().then((data) => setFeatured(data))
            }}
          />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">All Properties</h2>
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
                  <p className="font-medium">No properties match your filters</p>
                  <p>Try clearing the filters or broadening your search.</p>
                </CardContent>
              </Card>
            ) : view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((property) => (
                  <PropertyGridCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {data.map((property) => (
                  <PropertyListRow key={property.id} property={toListItem(property)} />
                ))}
              </div>
            )}

            <div
              ref={loaderRef}
              className="flex items-center justify-center py-6 text-sm text-muted-foreground"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Loading more...
                </span>
              ) : pagination.current_page < pagination.last_page ? (
                "Scroll for more..."
              ) : data.length > 0 ? (
                "End of results"
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
            className="absolute inset-y-0 left-0 w-full max-w-sm overflow-y-auto bg-background p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X className="size-4" />
              </Button>
            </div>
            <PropertyFilters value={filters} onChange={setFilters} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
