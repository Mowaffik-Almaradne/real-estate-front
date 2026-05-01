"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square,
  Building,
  Calendar,
  User,
  Mail,
  Loader2,
  X,
  MessageCircle,
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

import { propertyService } from "src/modules/properties/services/propertyService"
import type { Property } from "src/modules/properties/types"
import { DashboardLayout } from "components/layout/DashboardLayout"

interface User {
  id: number
  name: string
  email: string
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [creatingChat, setCreatingChat] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const data = await propertyService.getPropertyById(Number(id))
      setProperty(data)
    } catch (error) {
      console.error("Failed to fetch property:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const token = localStorage.getItem("token")
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/properties/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      toast.success("Property deleted successfully")
      router.push("/properties")
    } catch (error) {
      console.error("Failed to delete property:", error)
      toast.error("Failed to delete property")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleContact = async () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (currentUser.id === property.publisher?.id) {
      return
    }

    try {
      setCreatingChat(true)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/chat/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            type: "property",
            property_id: property.id,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create chat")
      }

      const chatRoom = await response.json()
      toast.success("Chat created successfully")
      router.push(`/chat?room=${chatRoom.id}`)
    } catch (error) {
      console.error("Failed to create chat:", error)
      toast.error("Failed to contact owner")
    } finally {
      setCreatingChat(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Property Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    )
  }

  if (!property) {
    return (
      <DashboardLayout title="Property Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Property not found</div>
        </div>
      </DashboardLayout>
    )
  }

  const canEdit = currentUser?.id === property.publisher?.id
  const images = [
    { url: property.main_image, thumb: property.main_image_thumb },
    ...(property.gallery || []).map((img) => ({ url: img.url, thumb: img.url_thumb })),
  ].filter((img) => img.url)

  return (
    <DashboardLayout title="Property Details">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/properties")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          {canEdit && (
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/properties/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={images[selectedImageIndex || 0]?.url || images[0]?.url}
                      alt={property.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border ${
                            (selectedImageIndex || 0) === index ? "border-foreground" : "border-transparent"
                          }`}
                        >
                          <img src={img.thumb || img.url} alt="" className="object-cover w-full h-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-muted rounded-lg">
                  <Building className="size-10 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{property.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-foreground">{property.formatted_price}</p>
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
                  <Bed className="size-4 text-slate-500" />
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>

        {property.detailed_info && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{property.detailed_info}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Publisher Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
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
              {currentUser && currentUser.id !== property.publisher?.id && (
                <Button onClick={handleContact} disabled={creatingChat}>
                  {creatingChat ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 h-4 w-4" />
                  )}
                  Contact
                </Button>
              )}
              {!currentUser && (
                <Button onClick={() => router.push("/login")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
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
          <img
            src={images[selectedImageIndex]?.url}
            alt={property.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}