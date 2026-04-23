"use client"

import { useState, useEffect, useCallback } from "react"
import { debounce } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye, Search, X, Loader2, MapPin, Bed, Bath, Square, Building } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Badge } from "components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Combobox } from "components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { StatusSelect } from "src/modules/properties/components/StatusSelect"
import type { PropertyStatus } from "src/modules/properties/types"

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
]

const CONTRACT_TYPES = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
]

const ROOM_OPTIONS = ["1", "2", "3", "4", "5+"]
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"]

interface Property {
  id: number
  name: string
  description: string
  country: { name: string }
  city: { name: string }
  type_of_contract: string
  property_type: string
  rooms: number
  bathrooms: number
  area: string
  price: string
  formatted_price: string
  status: string
  main_image: string
  main_image_thumb: string
  publisher: { name: string; email: string }
}

interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface PropertyStatistics {
  pending: number
  approved: number
  rejected: number
  suspended: number
  sold: number
  archived: number
  all: number
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    approved: { className: "bg-emerald-500 hover:bg-emerald-600", label: "Approved" },
    pending: { className: "bg-amber-500 hover:bg-amber-600", label: "Pending" },
    rejected: { className: "bg-red-500 hover:bg-red-600", label: "Rejected" },
    suspended: { className: "bg-orange-500 hover:bg-orange-600", label: "Suspended" },
    sold: { className: "bg-blue-500 hover:bg-blue-600", label: "Sold" },
    archived: { className: "bg-gray-500 hover:bg-gray-600", label: "Archived" },
  }
  const { className, label } = config[status] || { className: "bg-gray-500", label: status }
  return <Badge className={className}>{label}</Badge>
}

function StatusCard({
  status,
  count,
  isActive,
  onClick,
}: {
  status: string
  count: number
  isActive: boolean
  onClick: () => void
}) {
  const config: Record<string, { label: string; color: string }> = {
    approved: { label: "Approved", color: "bg-emerald-500" },
    pending: { label: "Pending", color: "bg-amber-500" },
    rejected: { label: "Rejected", color: "bg-red-500" },
    suspended: { label: "Suspended", color: "bg-orange-500" },
    sold: { label: "Sold", color: "bg-blue-500" },
    archived: { label: "Archived", color: "bg-gray-500" },
    all: { label: "All", color: "bg-primary" },
  }
  const { label, color } = config[status]

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-[4px] border transition-all text-left ${
        isActive
          ? "border-ring ring-2 ring-ring/20 bg-accent"
          : "border-border hover:border-ring/50 hover:bg-accent/50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`size-2.5 rounded-full ${color}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold">{count}</p>
    </button>
  )
}

function PropertyCard({ property, onDelete, onStatusChange }: { property: Property; onDelete: (id: number) => void; onStatusChange: (id: number, status: string) => Promise<void> }) {
  const router = useRouter()

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div
        className="relative h-48 bg-muted cursor-pointer"
        onClick={() => router.push(`/dashboard/properties/${property.id}`)}
      >
        {property.main_image_thumb || property.main_image ? (
          <img
            src={property.main_image_thumb || property.main_image}
            alt={property.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Building className="size-12" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusSelect status={property.status} onStatusChange={(newStatus) => onStatusChange(property.id, newStatus)} />
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg truncate">{property.name}</h3>
          <span className="font-bold text-foreground">
            {property.formatted_price}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="size-4" />
          <span className="truncate">
            {property.city?.name}, {property.country?.name}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Square className="size-4" />
            <span>{property.area} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="size-4" />
            <span>{property.rooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="size-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{property.publisher?.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/dashboard/properties/${property.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  const router = useRouter()
  const [data, setData] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
  })
  const [statistics, setStatistics] = useState<PropertyStatistics>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    sold: 0,
    archived: 0,
    all: 0,
  })
  const [loading, setLoading] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [countries, setCountries] = useState<{ id: number; name: string }[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [publishers, setPublishers] = useState<{ id: number; name: string }[]>([])
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [loadingCountry, setLoadingCountry] = useState(false)
  const [loadingCity, setLoadingCity] = useState(false)

  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    property_type: "",
    type_of_contract: "",
    country_id: "",
    city_id: "",
    publisher_id: "",
    rooms: "",
    bathrooms: "",
  })

  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters])

  const fetchStatistics = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/dashboard/properties/statistics`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      setStatistics(res.data.data)
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    }
  }, [])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedFilters.search) params.append("search", debouncedFilters.search)
      if (debouncedFilters.status) params.append("status", debouncedFilters.status)
      if (debouncedFilters.property_type) params.append("property_type", debouncedFilters.property_type)
      if (debouncedFilters.type_of_contract) params.append("type_of_contract", debouncedFilters.type_of_contract)
      if (debouncedFilters.country_id) params.append("country_id", debouncedFilters.country_id)
      if (debouncedFilters.city_id) params.append("city_id", debouncedFilters.city_id)
      if (debouncedFilters.publisher_id) params.append("publisher_id", debouncedFilters.publisher_id)
      if (debouncedFilters.rooms) params.append("rooms", debouncedFilters.rooms.replace("+", ""))
      if (debouncedFilters.bathrooms) params.append("bathrooms", debouncedFilters.bathrooms.replace("+", ""))
      params.append("page", String(page))
      params.append("per_page", "15")

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/dashboard/properties?${params}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedFilters, page])

  const loadFilterOptions = async () => {
    setLoadingFilters(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const [countriesRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/search/countries`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/search/users`, { headers }),
      ])
      
      setCountries(countriesRes.data.data || [])
      setPublishers(usersRes.data.data || [])
    } catch (error) {
      console.error("Failed to load filter options:", error)
    } finally {
      setLoadingFilters(false)
    }
  }

  const handleCountryChange = async (countryId: string) => {
    setFilters((prev) => ({ ...prev, country_id: countryId, city_id: "" }))
    setCities([])
    setCitySearch("")

    if (countryId) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/search/cities?country_id=${countryId}`,
          { headers }
        )
        setCities(res.data.data || [])
      } catch (error) {
        console.error("Failed to load cities:", error)
      }
    }
  }

  const handleCountrySearch = async (search: string) => {
    setCountrySearch(search)
    debouncedCountrySearch(search)
  }

  const debouncedCountrySearch = useCallback(
    debounce(async (search: string) => {
      setLoadingCountry(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/search/countries?search=${search}`, { headers })
        setCountries(res.data.data || [])
      } catch (error) {
        console.error("Failed to search countries:", error)
      } finally {
        setLoadingCountry(false)
      }
    }, 300),
    []
  )

  const handleCitySearch = async (search: string) => {
    setCitySearch(search)
    debouncedCitySearch(search)
  }

  const debouncedCitySearch = useCallback(
    debounce(async (search: string) => {
      if (!filters.country_id) return
      setLoadingCity(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/search/cities?country_id=${filters.country_id}&search=${search}`,
          { headers }
        )
        setCities(res.data.data || [])
      } catch (error) {
        console.error("Failed to search cities:", error)
      } finally {
        setLoadingCity(false)
      }
    }, 300),
    [filters.country_id]
  )

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const handleStatusClick = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
    }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      property_type: "",
      type_of_contract: "",
      country_id: "",
      city_id: "",
      publisher_id: "",
      rooms: "",
      bathrooms: "",
    })
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/dashboard/properties/${deletingPropertyId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      toast.success("Property deleted successfully")
      fetchProperties()
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/dashboard/properties/${id}/status`,
        { status: newStatus },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      setData((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      )
      toast.success(`Property status updated to ${newStatus}`)
      fetchStatistics()
      fetchProperties()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.property_type ||
    filters.type_of_contract ||
    filters.country_id ||
    filters.city_id ||
    filters.publisher_id ||
    filters.rooms ||
    filters.bathrooms

  return (
    <DashboardLayout title="Properties">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Properties Overview</CardTitle>
            <CardDescription>Manage and filter your property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              <StatusCard
                status="all"
                count={statistics.all}
                isActive={filters.status === ""}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, status: "" }))
                  setPage(1)
                }}
              />
              <StatusCard
                status="pending"
                count={statistics.pending}
                isActive={filters.status === "pending"}
                onClick={() => handleStatusClick("pending")}
              />
              <StatusCard
                status="approved"
                count={statistics.approved}
                isActive={filters.status === "approved"}
                onClick={() => handleStatusClick("approved")}
              />
              <StatusCard
                status="rejected"
                count={statistics.rejected}
                isActive={filters.status === "rejected"}
                onClick={() => handleStatusClick("rejected")}
              />
              <StatusCard
                status="suspended"
                count={statistics.suspended}
                isActive={filters.status === "suspended"}
                onClick={() => handleStatusClick("suspended")}
              />
              <StatusCard
                status="sold"
                count={statistics.sold}
                isActive={filters.status === "sold"}
                onClick={() => handleStatusClick("sold")}
              />
              <StatusCard
                status="archived"
                count={statistics.archived}
                isActive={filters.status === "archived"}
                onClick={() => handleStatusClick("archived")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or keyword..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  value={filters.property_type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, property_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type_of_contract}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, type_of_contract: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Contract Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Combobox
                  value={filters.country_id}
                  onValueChange={(value) => handleCountryChange(value)}
                  placeholder="Country"
                  options={countries.map((c) => ({ value: String(c.id), label: c.name }))}
                  onSearch={handleCountrySearch}
                  loading={loadingCountry}
                  searchPlaceholder="Search countries..."
                />

                <Combobox
                  value={filters.city_id}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, city_id: value }))
                  }
                  placeholder="City"
                  options={cities.map((c) => ({ value: String(c.id), label: c.name }))}
                  disabled={!filters.country_id}
                  onSearch={handleCitySearch}
                  loading={loadingCity}
                  searchPlaceholder="Search cities..."
                />

                <Select
                  value={filters.publisher_id}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, publisher_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishers.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.rooms}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, rooms: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_OPTIONS.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room} {room === "1" ? "Room" : "Rooms"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.bathrooms}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, bathrooms: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATHROOM_OPTIONS.map((bath) => (
                      <SelectItem key={bath} value={bath}>
                        {bath} {bath === "1" ? "Bathroom" : "Bathrooms"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-fit"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No properties found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((property) => (
                  <PropertyCard key={property.id} property={property} onDelete={handleDeleteClick} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}

            {!loading && data.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
                  {pagination.total} properties
                  {filters.status && ` (filtered by ${filters.status})`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.last_page, p + 1))
                    }
                    disabled={page >= pagination.last_page || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}