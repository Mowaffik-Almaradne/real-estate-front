"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye, Loader2, MapPin, Bed, Bath, Square, Building, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog"

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

function PropertyCard({ property, canEdit, onDelete }: { property: Property; canEdit: boolean; onDelete: (id: number) => void }) {
  const router = useRouter()

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div
        className="relative h-48 bg-muted cursor-pointer"
        onClick={() => router.push(`/properties/${property.id}`)}
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
          <Badge>
            {property.status === "approved" ? "Approved" : property.status === "pending" ? "Pending" : property.status}
          </Badge>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/properties/${property.id}/edit`)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(property.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturedPropertyCard({ property }: { property: Property }) {
  const router = useRouter()

  return (
    <div
      className="flex-shrink-0 w-72 bg-card rounded-lg border border-border shadow-sm overflow-hidden cursor-pointer"
      onClick={() => router.push(`/properties/${property.id}`)}
    >
      <div className="relative h-40 bg-muted">
        {property.main_image_thumb || property.main_image ? (
          <img
            src={property.main_image_thumb || property.main_image}
            alt={property.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Building className="size-10" />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            {property.type_of_contract === "rent" ? "Rent" : "Sale"}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm truncate">{property.name}</h4>
        <p className="font-bold text-foreground text-sm">{property.formatted_price}</p>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  const router = useRouter()
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [data, setData] = useState<Property[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
  })
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/properties/random`
      )
      setFeaturedProperties(res.data.data || [])
    } catch (error) {
      console.error("Failed to fetch featured properties:", error)
    }
  }, [])

  const fetchProperties = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/properties?page=${pageNum}&per_page=12`
      )

      if (append) {
        setData(prev => [...prev, ...(res.data.data || [])])
      } else {
        setData(res.data.data || [])
      }
      setPagination(res.data.pagination)
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchFeaturedProperties()
    fetchProperties(1)
  }, [fetchFeaturedProperties, fetchProperties])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && pagination.current_page < pagination.last_page) {
          fetchProperties(pagination.current_page + 1, true)
        }
      },
      { threshold: 1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadingMore, pagination.current_page, pagination.last_page, fetchProperties])

  const handleDeleteClick = (id: number) => {
    setDeletingPropertyId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPropertyId) return

    try {
      setDeleting(true)
      const token = localStorage.getItem("token")
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/properties/${deletingPropertyId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      toast.success("Property deleted successfully")
      setData(prev => prev.filter(p => p.id !== deletingPropertyId))
    } catch (error) {
      console.error("Failed to delete property:", error)
      toast.error("Failed to delete property")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setDeletingPropertyId(null)
    }
  }

  const scrollFeatured = (direction: "left" | "right") => {
    const container = document.getElementById("featured-scroll")
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground900">Properties</h1>
          <Button onClick={() => router.push("/properties/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Property
          </Button>
        </div>

        {featuredProperties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground900 mb-4">Featured Properties</h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" id="featured-scroll">
                {featuredProperties.map((property) => (
                  <FeaturedPropertyCard key={property.id} property={property} />
                ))}
              </div>
              <button
                onClick={() => scrollFeatured("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-background shadow-md rounded-full p-2 hover:bg-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollFeatured("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-background shadow-md rounded-full p-2 hover:bg-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground900 mb-4">All Properties</h2>

        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-foreground400" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-foreground500">
            No properties found.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  canEdit={currentUser?.id === property.publisher?.id}
                  onDelete={handleDeleteClick}
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
    </div>
  )
}