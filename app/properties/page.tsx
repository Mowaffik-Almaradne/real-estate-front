"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Eye, Loader2, Bed, Bath, Square, Plus, MapPin, Building, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { apiClient } from "@/lib/apiClient"
import { getStoredUser } from "@/lib/auth"
import { propertyService } from "src/modules/properties/services/propertyService"

import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { PropertyCarousel } from "components/properties/PropertyCarousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const fetcher = async (url: string) => {
  const response = await apiClient.get(url)
  return response.data
}

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
  publisher: { id: number; name: string; email: string }
}

interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface User {
  id: number
  name: string
  email: string
}

function PropertyCard({ property, canEdit }: { property: Property; canEdit: boolean }) {
  const router = useRouter()
  const [changingStatus, setChangingStatus] = useState(false)

  const handleStatusChange = async (id: number) => {
    try {
      setChangingStatus(true)
      await propertyService.updateStatus(id, "sold")
      toast.success("Property status updated to sold")
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    } finally {
      setChangingStatus(false)
    }
  }

  return (
    <div className="group bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
      <div
        className="relative h-48 bg-muted cursor-pointer overflow-hidden"
        onClick={() => router.push(`/properties/${property.id}`)}
      >
        {property.main_image_thumb || property.main_image ? (
          <img
            src={property.main_image_thumb || property.main_image}
            alt={property.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Building className="size-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <Badge className="rounded-lg">
            {property.status === "approved" ? "Approved" : property.status === "pending" ? "Pending" : property.status}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center rounded-lg bg-white/90 dark:bg-background/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
            {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg truncate">{property.name}</h3>
          <span className="font-bold text-gradient text-lg">
            {property.formatted_price}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="size-4 text-primary" />
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

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{property.publisher?.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/properties/${property.id}`)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange(property.id)
                  }}
                  disabled={changingStatus}
                >
                  {changingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/properties/${property.id}/edit`)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [data, setData] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
  })
  const [loadingMore, setLoadingMore] = useState(false)

  const loaderRef = useRef<HTMLDivElement>(null)

  const {
    data: featuredData,
    error: featuredError,
    isLoading: featuredLoading,
    mutate: refreshFeatured,
  } = useSWR(
    `${apiUrl}/public/properties/random`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  )

  const {
    data: propertiesData,
    error: propertiesError,
    isLoading: propertiesLoading,
    mutate: refreshProperties,
  } = useSWR(
    `${apiUrl}/public/properties/browse?page=1&per_page=12`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  const featuredProperties = featuredData?.data || []
  const isLoading = featuredLoading || propertiesLoading

  useEffect(() => {
    const user = getStoredUser()
    if (user) setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (propertiesData) {
      setData(propertiesData.data || [])
      setPagination(propertiesData.pagination)
    }
  }, [propertiesData])

  const fetchMoreProperties = useCallback(async (pageNum: number) => {
    if (pageNum === 1) return

    setLoadingMore(true)
    try {
      const res = await apiClient.get(
        `${apiUrl}/public/properties/browse?page=${pageNum}&per_page=12`
      )
      setData(prev => [...prev, ...(res.data.data || [])])
      setPagination(res.data.pagination)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && pagination.current_page < pagination.last_page) {
          fetchMoreProperties(pagination.current_page + 1)
        }
      },
      { threshold: 1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadingMore, pagination.current_page, pagination.last_page, fetchMoreProperties])

  return (
    <DashboardLayout title="Properties">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Properties
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Browse and manage property listings</p>
          </div>
          <Button onClick={() => router.push("/properties/create")} className="rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Property
          </Button>
        </div>

        <PropertyCarousel
          properties={featuredProperties}
          title="Featured Properties"
          loading={isLoading}
          error={featuredError}
          onRetry={() => refreshFeatured()}
        />

        <h2 className="text-lg font-semibold text-foreground mb-4">All Properties</h2>

        {isLoading && data.length === 0 ? (
          <PropertyCarousel
            properties={[]}
            title=""
            loading={true}
            skeletonCount={12}
          />
        ) : data.length === 0 ? (
          <PropertyCarousel
            properties={[]}
            title=""
            emptyTitle="No Properties Found"
            emptyDescription="There are no properties available at the moment. Be the first to create a property listing!"
            emptyActionLabel="Create Property"
            onEmptyAction={() => router.push("/properties/create")}
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  canEdit={currentUser?.id === property.publisher?.id}
                />
              ))}
            </div>

            <div ref={loaderRef} className="flex items-center justify-center py-8">
              {loadingMore ? (
                <Loader2 className="h-6 w-6 animate-spin text-foreground400" />
              ) : pagination.current_page < pagination.last_page ? (
                <span className="text-foreground500">Scroll for more...</span>
              ) : data.length > 0 ? (
                <span className="text-foreground500">No more properties</span>
              ) : null}
            </div>
          </>
        )}
      </div>

    </DashboardLayout>
  )
}
