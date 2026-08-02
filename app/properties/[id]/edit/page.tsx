"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Textarea } from "components/ui/textarea"
import { Label } from "components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SearchSelect,
} from "components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "components/ui/card"

import type { PropertyType, TypeOfContract } from "src/modules/properties/types"
import { getCountries, getCitiesByCountry, type Country, type City } from "lib/api"
import { propertyService } from "src/modules/properties/services/propertyService"

const propertySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().min(1, "Description is required"),
  country_id: z.number().min(1, "Country is required"),
  city_id: z.number().min(1, "City is required"),
  property_type: z.string().min(1, "Property type is required"),
  type_of_contract: z.string().min(1, "Contract type is required"),
  rooms: z.number().min(0, "Rooms must be a positive number"),
  bathrooms: z.number().min(0, "Bathrooms must be a positive number"),
  area: z.number().min(0, "Area must be a positive number"),
  detailed_info: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.string().length(3).optional().or(z.literal("")),
})

type PropertyFormValues = z.infer<typeof propertySchema>

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
]

const CONTRACT_TYPES: { value: TypeOfContract; label: string }[] = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
]

export default function PropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      country_id: 0,
      city_id: 0,
      property_type: "",
      type_of_contract: "",
      rooms: 0,
      bathrooms: 0,
      area: 0,
      detailed_info: "",
      price: 0,
      currency: "USD",
    },
  })

  const watchedCountryId = watch("country_id")

  useEffect(() => {
    loadCountries()
    fetchProperty()
  }, [id])

  useEffect(() => {
    if (watchedCountryId) {
      loadCities(Number(watchedCountryId))
      setSelectedCountryId(Number(watchedCountryId))
    }
  }, [watchedCountryId])

  const loadCountries = async () => {
    try {
      const response = await getCountries(1, 100)
      setCountries(response.data)
    } catch (error) {
      console.error("Failed to load countries:", error)
    }
  }

  const loadCities = async (countryId: number) => {
    try {
      const data = await getCitiesByCountry(countryId)
      setCities(data)
    } catch (error) {
      console.error("Failed to load cities:", error)
    }
  }

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const property = await propertyService.getPropertyById(Number(id))

      setValue("name", property.name)
      setValue("description", property.description)
      setValue("country_id", property.country.id)
      setValue("city_id", property.city.id)
      setValue("property_type", property.property_type)
      setValue("type_of_contract", property.type_of_contract)
      setValue("rooms", property.rooms)
      setValue("bathrooms", property.bathrooms)
      setValue("area", Number(property.area))
      setValue("detailed_info", property.detailed_info || "")
      setValue("price", Number(property.price))
      setValue("currency", property.currency || "USD")

      setSelectedCountryId(property.country.id)
      await loadCities(property.country.id)
    } catch (error) {
      console.error("Failed to fetch property:", error)
      toast.error("Failed to load property")
      router.push("/properties")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setSaving(true)

      await propertyService.updateProperty(Number(id), {
        name: data.name,
        description: data.description,
        country_id: data.country_id,
        city_id: data.city_id,
        property_type: data.property_type as PropertyType,
        type_of_contract: data.type_of_contract as TypeOfContract,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        area: data.area,
        detailed_info: data.detailed_info || undefined,
        price: data.price,
        currency: data.currency || "USD",
      })

      toast.success("Property updated successfully")
      router.push(`/properties/${id}`)
    } catch (error) {
      console.error("Failed to update property:", error)
      toast.error("Failed to update property")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push(`/properties/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Property</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter property name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter property description"
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm font-medium text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailed_info">Detailed Information</Label>
                <Textarea
                  id="detailed_info"
                  placeholder="Enter additional details"
                  rows={4}
                  {...register("detailed_info")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country_id">Country *</Label>
                  <SearchSelect
                    value={watchedCountryId ? String(watchedCountryId) : ""}
                    onValueChange={(value) => {
                      setValue("country_id", Number(value))
                      setValue("city_id", 0)
                      setCities([])
                    }}
                    placeholder="Select country"
                    options={countries.map((c) => ({ value: String(c.id), label: c.name }))}
                  />
                  {errors.country_id && (
                    <p className="text-sm font-medium text-red-500">{errors.country_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_id">City *</Label>
                  <SearchSelect
                    value={watch("city_id") ? String(watch("city_id")) : ""}
                    onValueChange={(value) => setValue("city_id", Number(value))}
                    placeholder="Select city"
                    options={cities.map((c) => ({ value: String(c.id), label: c.name }))}
                    disabled={!selectedCountryId || cities.length === 0}
                  />
                  {errors.city_id && (
                    <p className="text-sm font-medium text-red-500">{errors.city_id.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={watch("property_type")}
                    onValueChange={(value) => setValue("property_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_type && (
                    <p className="text-sm font-medium text-red-500">{errors.property_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_of_contract">Contract Type *</Label>
                  <Select
                    value={watch("type_of_contract")}
                    onValueChange={(value) => setValue("type_of_contract", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type_of_contract && (
                    <p className="text-sm font-medium text-red-500">{errors.type_of_contract.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="rooms">Rooms *</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="0"
                    {...register("rooms", { valueAsNumber: true })}
                  />
                  {errors.rooms && (
                    <p className="text-sm font-medium text-red-500">{errors.rooms.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    {...register("bathrooms", { valueAsNumber: true })}
                  />
                  {errors.bathrooms && (
                    <p className="text-sm font-medium text-red-500">{errors.bathrooms.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("area", { valueAsNumber: true })}
                  />
                  {errors.area && (
                    <p className="text-sm font-medium text-red-500">{errors.area.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm font-medium text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    maxLength={3}
                    {...register("currency")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/properties/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
