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
  Heart,
  Share2,
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
import { getStoredUser } from "@/lib/auth"
import { chatService } from "@/services/chat-service"
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
    setCurrentUser(getStoredUser())
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
      await propertyService.deleteProperty(Number(id))
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

    if (!property || currentUser.id === property.publisher?.id) {
      return
    }

    try {
      setCreatingChat(true)
      const chatRoom = await chatService.createRoom({
        type: "group",
        property_id: property.id,
      })
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!property) {
    return (
      <DashboardLayout title="Property Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium">Property not found</p>
          </div>
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/properties")} className="rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          {canEdit && (
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/properties/${id}/edit`)} className="rounded-lg">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="rounded-lg">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card className="bg-card border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={images[selectedImageIndex || 0]?.url || images[0]?.url}
                        alt={property.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative size-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                              (selectedImageIndex || 0) === index
                                ? "border-primary shadow-sm shadow-primary/25"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={img.thumb || img.url} alt="" className="object-cover w-full h-full" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-60 bg-muted">
                    <Building className="size-12 text-muted-foreground/30" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border/50">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-gradient">{property.formatted_price}</p>
                </div>

                <h1 className="text-xl font-bold text-foreground">{property.name}</h1>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>
                    {property.city?.name}, {property.country?.name}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary" className="rounded-lg">
                    {property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : "Property"}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg">
                    {property.type_of_contract === "rent" ? "For Rent" : "For Sale"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 rounded-xl bg-accent/50">
                    <Square className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-sm font-semibold">{property.area} m&sup2;</span>
                    <p className="text-xs text-muted-foreground">Area</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-accent/50">
                    <Bed className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-sm font-semibold">{property.rooms}</span>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-accent/50">
                    <Bath className="size-4 mx-auto text-primary mb-1" />
                    <span className="text-sm font-semibold">{property.bathrooms}</span>
                    <p className="text-xs text-muted-foreground">Baths</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-xl gradient-primary text-primary-foreground">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{property.publisher?.name}</p>
                      <p className="text-xs text-muted-foreground">{property.publisher?.email}</p>
                    </div>
                  </div>
                  {currentUser && currentUser.id !== property.publisher?.id && (
                    <Button onClick={handleContact} disabled={creatingChat} size="sm" className="rounded-lg">
                      {creatingChat ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                      )}
                      Contact
                    </Button>
                  )}
                  {!currentUser && (
                    <Button onClick={() => router.push("/login")} size="sm" className="rounded-lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{property.description}</p>
          </CardContent>
        </Card>

        {property.detailed_info && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{property.detailed_info}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Additional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-accent/30">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-4" />
                  Created
                </span>
                <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
              {property.updated_at && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-accent/30">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-4" />
                    Updated
                  </span>
                  <span className="font-medium">{new Date(property.updated_at).toLocaleDateString()}</span>
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
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-lg">
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X className="size-8" />
          </button>
          <img
            src={images[selectedImageIndex]?.url}
            alt={property.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
