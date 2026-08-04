"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, RotateCcw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getCountries, getCitiesByCountry, type Country, type City } from "@/lib/api"
import { PropertyType, TypeOfContract } from "@/types/enums"
import { cn } from "@/lib/utils"

const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.apartment, label: "Apartment" },
  { value: PropertyType.house, label: "House" },
  { value: PropertyType.villa, label: "Villa" },
  { value: PropertyType.land, label: "Land" },
  { value: PropertyType.commercial, label: "Commercial" },
  { value: PropertyType.office, label: "Office" },
  { value: PropertyType.warehouse, label: "Warehouse" },
  { value: PropertyType.other, label: "Other" },
]

const CONTRACT_OPTIONS = [
  { value: TypeOfContract.sale, label: "For Sale" },
  { value: TypeOfContract.rent, label: "For Rent" },
]

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest" },
  { value: "created_at:asc", label: "Oldest" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
] as const

export interface PropertyFilterValues {
  search: string
  country_id: number | null
  city_id: number | null
  property_type: PropertyType | ""
  type_of_contract: TypeOfContract | ""
  rooms: string
  bathrooms: string
  min_price: string
  max_price: string
  sort: string
}

export const EMPTY_FILTERS: PropertyFilterValues = {
  search: "",
  country_id: null,
  city_id: null,
  property_type: "",
  type_of_contract: "",
  rooms: "",
  bathrooms: "",
  min_price: "",
  max_price: "",
  sort: "created_at:desc",
}

interface PropertyFiltersProps {
  value?: PropertyFilterValues
  initial?: Partial<PropertyFilterValues>
  onChange: (filters: PropertyFilterValues) => void
  className?: string
  showPrice?: boolean
}

export function PropertyFilters({
  value,
  initial,
  onChange,
  className,
  showPrice = true,
}: PropertyFiltersProps) {
  const [internal, setInternal] = useState<PropertyFilterValues>({
    ...EMPTY_FILTERS,
    ...initial,
  })
  const values = value ?? internal
  const setValues = setInternal
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    let active = true
    setLoadingCountries(true)
    void getCountries(1, 100)
      .then((res) => {
        if (active) setCountries(res.data ?? [])
      })
      .catch(() => {
        if (active) setCountries([])
      })
      .finally(() => {
        if (active) setLoadingCountries(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!values.country_id) {
      setCities([])
      return
    }
    let active = true
    setLoadingCities(true)
    void getCitiesByCountry(values.country_id)
      .then((list) => {
        if (active) setCities(list)
      })
      .catch(() => {
        if (active) setCities([])
      })
      .finally(() => {
        if (active) setLoadingCities(false)
      })
    return () => {
      active = false
    }
  }, [values.country_id])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      onChange(values)
    }, 300)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const update = <K extends keyof PropertyFilterValues>(key: K, value: PropertyFilterValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === "country_id" && value !== current.country_id) {
        next.city_id = null
      }
      return next
    })
  }

  const clear = () => {
    setValues({ ...EMPTY_FILTERS })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="property-search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="property-search"
            placeholder="Name, description..."
            className="pl-9"
            value={values.search}
            onChange={(event) => update("search", event.target.value)}
          />
          {values.search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update("search", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contract</Label>
        <div className="flex flex-wrap gap-2">
          {CONTRACT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={values.type_of_contract === option.value ? "default" : "outline"}
              onClick={() =>
                update(
                  "type_of_contract",
                  values.type_of_contract === option.value ? "" : option.value
                )
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property type</Label>
        <Select
          value={values.property_type || "all"}
          onValueChange={(value) =>
            update("property_type", value === "all" ? "" : (value as PropertyType))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Country</Label>
        <Select
          value={values.country_id ? String(values.country_id) : "all"}
          onValueChange={(value) =>
            update("country_id", value === "all" ? null : Number(value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCountries ? "Loading..." : "Any"} />
            {loadingCountries && <Loader2 className="size-3 animate-spin" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={String(country.id)}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>City</Label>
        <Select
          value={values.city_id ? String(values.city_id) : "all"}
          onValueChange={(value) =>
            update("city_id", value === "all" ? null : Number(value))
          }
          disabled={!values.country_id}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !values.country_id
                  ? "Pick a country first"
                  : loadingCities
                    ? "Loading..."
                    : "Any"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={String(city.id)}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="rooms">Beds</Label>
          <Select
            value={values.rooms || "all"}
            onValueChange={(value) => update("rooms", value === "all" ? "" : value)}
          >
            <SelectTrigger id="rooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baths</Label>
          <Select
            value={values.bathrooms || "all"}
            onValueChange={(value) => update("bathrooms", value === "all" ? "" : value)}
          >
            <SelectTrigger id="bathrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showPrice && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="min-price">Min price</Label>
            <Input
              id="min-price"
              type="number"
              min="0"
              placeholder="0"
              value={values.min_price}
              onChange={(event) => update("min_price", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-price">Max price</Label>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder="Any"
              value={values.max_price}
              onChange={(event) => update("max_price", event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={values.sort} onValueChange={(value) => update("sort", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={clear}
      >
        <RotateCcw className="size-3" />
        Clear filters
      </Button>
    </div>
  )
}
