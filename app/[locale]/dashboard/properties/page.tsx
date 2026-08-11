"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { debounce } from "@/lib/utils"

import { apiClient } from "@/lib/apiClient"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import {
  PropertyStatsOverview,
  PropertyFiltersPanel,
  PropertyGridView,
  PropertyDeleteDialog,
  usePropertyFilters,
  buildPropertiesApiParams,
  type PaginationInfo,
  type PropertyStatistics,
  type DashboardProperty,
} from "src/modules/properties/dashboard"

interface ComboboxOption {
  value: string
  label: string
}

interface ReferenceData {
  id: number
  name: string
}

const INITIAL_STATISTICS: PropertyStatistics = {
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
  sold: 0,
  archived: 0,
  all: 0,
}

const INITIAL_PAGINATION: PaginationInfo = {
  total: 0,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  from: 1,
  to: 1,
}

export default function PropertiesPage() {
  const tNav = useTranslations("nav")
  const {
    filters,
    debouncedFilters,
    setFilterField,
    setStatusFilter,
    setFilters,
    clear,
    hasActive,
  } = usePropertyFilters()

  const [data, setData] = useState<DashboardProperty[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>(INITIAL_PAGINATION)
  const [statistics, setStatistics] = useState<PropertyStatistics>(INITIAL_STATISTICS)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [countries, setCountries] = useState<ComboboxOption[]>([])
  const [cities, setCities] = useState<ComboboxOption[]>([])
  const [publishers, setPublishers] = useState<ReferenceData[]>([])
  const [loadingCountry, setLoadingCountry] = useState(false)
  const [loadingCity, setLoadingCity] = useState(false)

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await apiClient.get("/dashboard/properties/statistics")
      setStatistics(res.data.data)
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    }
  }, [])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildPropertiesApiParams(debouncedFilters, page)
      const res = await apiClient.get("/dashboard/properties", { params })
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedFilters, page])

  const loadFilterOptions = useCallback(async () => {
    try {
      const [countriesRes, usersRes] = await Promise.all([
        apiClient.get("/search/countries"),
        apiClient.get("/search/users"),
      ])
      setCountries(
        (countriesRes.data.data || []).map((c: ReferenceData) => ({
          value: String(c.id),
          label: c.name,
        }))
      )
      setPublishers(usersRes.data.data || [])
    } catch (error) {
      console.error("Failed to load filter options:", error)
    }
  }, [])

  const handleCountryChange = async (countryId: string) => {
    setFilters((prev) => ({ ...prev, country_id: countryId, city_id: "" }))
    setCities([])
    if (countryId) {
      try {
        const res = await apiClient.get("/search/cities", {
          params: { country_id: countryId },
        })
        setCities(
          (res.data.data || []).map((c: ReferenceData) => ({
            value: String(c.id),
            label: c.name,
          }))
        )
      } catch (error) {
        console.error("Failed to load cities:", error)
      }
    }
  }

  const debouncedCountrySearch = useMemo(
    () =>
      debounce(async (search: string) => {
        setLoadingCountry(true)
        try {
          const res = await apiClient.get("/search/countries", {
            params: { search },
          })
          setCountries(
            (res.data.data || []).map((c: ReferenceData) => ({
              value: String(c.id),
              label: c.name,
            }))
          )
        } catch (error) {
          console.error("Failed to search countries:", error)
        } finally {
          setLoadingCountry(false)
        }
      }, 300),
    []
  )

  const debouncedCitySearch = useMemo(
    () =>
      debounce(async (search: string, countryId: number) => {
        setLoadingCity(true)
        try {
          const res = await apiClient.get("/search/cities", {
            params: { country_id: countryId, search },
          })
          setCities(
            (res.data.data || []).map((c: ReferenceData) => ({
              value: String(c.id),
              label: c.name,
            }))
          )
        } catch (error) {
          console.error("Failed to search cities:", error)
        } finally {
          setLoadingCity(false)
        }
      }, 300),
    []
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchStatistics()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchStatistics])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchProperties()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchProperties])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadFilterOptions()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [loadFilterOptions])

  const handleStatusCardClick = (status: string) => {
    setStatusFilter(filters.status === status ? "" : status)
    setPage(1)
  }

  const handleClearFilters = () => {
    clear()
    setCities([])
  }

  const handleDeleteClick = (id: number) => {
    setDeletingPropertyId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPropertyId) return

    try {
      setDeleting(true)
      await apiClient.delete(`/dashboard/properties/${deletingPropertyId}`)
      toast.success("Property deleted successfully")
      await fetchProperties()
    } catch (error) {
      console.error("Failed to delete property:", error)
      toast.error("Failed to delete property")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setDeletingPropertyId(null)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/dashboard/properties/${id}/status`, {
        status: newStatus,
      })
      setData((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      )
      toast.success(`Property status updated to ${newStatus}`)
      await Promise.all([fetchStatistics(), fetchProperties()])
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  return (
    <DashboardLayout title={tNav("properties")}>
      <div className="space-y-6">
        <PropertyStatsOverview
          statistics={statistics}
          activeStatus={filters.status}
          onStatusClick={handleStatusCardClick}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyFiltersPanel
              filters={filters}
              onChange={setFilterField}
              onClear={handleClearFilters}
              hasActive={hasActive}
              countries={countries}
              cities={cities}
              publishers={publishers}
              onCountryChange={handleCountryChange}
              onCountrySearch={(search: string) => void debouncedCountrySearch(search)}
              onCitySearch={(search: string) => {
                if (filters.country_id) {
                  void debouncedCitySearch(search, Number(filters.country_id))
                }
              }}
              loadingCountry={loadingCountry}
              loadingCity={loadingCity}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <PropertyGridView
              properties={data}
              loading={loading}
              pagination={pagination}
              filteredStatus={filters.status}
              page={page}
              onPageChange={setPage}
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>
      </div>

      <PropertyDeleteDialog
        open={showDeleteDialog}
        deleting={deleting}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardLayout>
  )
}