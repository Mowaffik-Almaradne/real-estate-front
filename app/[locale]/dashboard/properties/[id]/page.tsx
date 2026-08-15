"use client"

import { useCallback, useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square,
  Building,
  User,
  Mail,
  Loader2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "components/ui/dialog"
import { DashboardLayout } from "components/layout/DashboardLayout"

import { getStoredUser } from "@/lib/auth"
import { CreateDepositDialog } from "src/modules/deposits/components/CreateDepositDialog"
import { propertyService } from "src/modules/properties/services/propertyService"
import { StatusSelect } from "src/modules/properties/components/StatusSelect"
import type { PropertyDto as Property } from "@/types/dto"
import type { PropertyStatus } from "@/types/enums"

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [currentUser] = useState(() => {
    try {
      return getStoredUser()
    } catch {
      return null
    }
  })

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true)
      const data = await propertyService.getPropertyById(Number(id))
      setProperty(data)
    } catch (error) {
      console.error("Failed to fetch property:", error)
      router.push("/dashboard/properties")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchProperty()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchProperty])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await propertyService.deleteProperty(Number(id))
      router.push("/dashboard/properties")
    } catch (error) {
      console.error("Failed to delete property:", error)
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusUpdateNew = async (newStatus: string) => {
    try {
      const updated = await propertyService.updateStatus(Number(id), newStatus as PropertyStatus)
      setProperty(updated)
      toast.success(`Property status updated to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Property Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!property) {
    return (
      <DashboardLayout title="Property Details">
        <div className="text-center py-12">Property not found</div>
      </DashboardLayout>
    )
  }

  const images: { url: string; thumb: string }[] = [
    ...(property.main_image ? [{ url: property.main_image, thumb: property.main_image_thumb ?? property.main_image }] : []),
    ...(property.gallery || []).map((img) => ({ url: img.url, thumb: img.url_thumb ?? img.url })),
  ]

  return (
    <DashboardLayout title="Property Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/dashboard/properties")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          <div className="flex gap-2">
            {currentUser?.id === property.publisher?.id &&
              property.status !== "sold" &&
              property.publisher?.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDepositOpen(true)}
                >
                  Create Deposit
                </Button>
              )}
            <Button onClick={() => router.push(`/dashboard/properties/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Property
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-[4px] overflow-hidden">
                    <Image
                      src={images[selectedImageIndex || 0]?.url ?? images[0]?.url ?? ""}
                      alt={property.name}
                      width={1280}
                      height={720}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-16 h-16 rounded-[4px] overflow-hidden flex-shrink-0 border ${
                            (selectedImageIndex || 0) === index ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <Image src={img.thumb ?? img.url} alt="" width={160} height={120} className="object-cover w-full h-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-muted rounded-[4px]">
                  <Building className="size-10 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{property.name}</CardTitle>
                <StatusSelect
                  status={property.status}
                  onStatusChange={handleStatusUpdateNew}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">{property.formatted_price}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>
                  {property.city?.name}, {property.country?.name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Square className="size-4 text-muted-foreground" />
                  <span>{property.area} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="size-4 text-muted-foreground" />
                  <span>{property.rooms} Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="size-4 text-muted-foreground" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary">
                  {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : "Property"}
                </Badge>
                <Badge variant="outline">
                  {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>

        {property.detailed_info && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{property.detailed_info}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Publisher Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">{property.publisher?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span>{property.publisher?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created At</span>
                <span>{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
              {property.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated At</span>
                  <span>{new Date(property.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              {property.longitude && property.latitude && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>
                    {property.latitude}, {property.longitude}
                  </span>
                </div>
              )}
            </div>
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentUser?.id === property.publisher?.id &&
        property.status !== "sold" &&
        property.publisher?.id && (
          <CreateDepositDialog
            open={depositOpen}
            onOpenChange={setDepositOpen}
            propertyId={property.id}
            propertyName={property.name}
            sellerId={property.publisher.id}
            defaultCurrency={property.currency}
          />
        )}

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X className="size-8" />
          </button>
          <Image
            src={images[selectedImageIndex ?? 0]?.url ?? ""}
            alt={property.name}
            width={1280}
            height={720}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}