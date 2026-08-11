"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
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

type PropertyTypeKey = Exclude<PropertyType, "">

const PROPERTY_TYPE_VALUES: PropertyTypeKey[] = [
  PropertyType.apartment,
  PropertyType.house,
  PropertyType.villa,
  PropertyType.land,
  PropertyType.commercial,
  PropertyType.office,
  PropertyType.warehouse,
  PropertyType.other,
]

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
  const t = useTranslations("property.filters")
  const tCommon = useTranslations("common")
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
    const handle = window.setTimeout(() => {
      if (!active) return
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
    }, 0)
    return () => {
      active = false
      window.clearTimeout(handle)
    }
  }, [])

  useEffect(() => {
    if (!values.country_id) {
      const handle = window.setTimeout(() => setCities([]), 0)
      return () => window.clearTimeout(handle)
    }
    const countryId = values.country_id
    let active = true
    const handle = window.setTimeout(() => {
      if (!active) return
      setLoadingCities(true)
      void getCitiesByCountry(countryId)
        .then((list) => {
          if (active) setCities(list)
        })
        .catch(() => {
          if (active) setCities([])
        })
        .finally(() => {
          if (active) setLoadingCities(false)
        })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(handle)
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
        <Label htmlFor="property-search">{t("search")}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            id="property-search"
            placeholder={t("searchPlaceholder")}
            className="pl-9 rtl:pl-3 rtl:pr-9"
            value={values.search}
            onChange={(event) => update("search", event.target.value)}
          />
          {values.search && (
            <button
              type="button"
              aria-label={t("clearSearch")}
              onClick={() => update("search", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent rtl:right-auto rtl:left-2"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("contract")}</Label>
        <div className="flex flex-wrap gap-2">
          {([TypeOfContract.sale, TypeOfContract.rent] as const).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={values.type_of_contract === option ? "default" : "outline"}
              onClick={() =>
                update(
                  "type_of_contract",
                  values.type_of_contract === option ? "" : option
                )
              }
            >
              {t(`contractOption.${option}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="property-type-select">{t("propertyType")}</Label>
        <Select
          value={values.property_type || "all"}
          onValueChange={(value) =>
            update("property_type", value === "all" ? "" : (value as PropertyType))
          }
        >
          <SelectTrigger id="property-type-select" aria-label={t("propertyType")}>
            <SelectValue placeholder={t("any")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("any")}</SelectItem>
            {PROPERTY_TYPE_VALUES.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`type.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country-select">{t("country")}</Label>
        <Select
          value={values.country_id ? String(values.country_id) : "all"}
          onValueChange={(value) =>
            update("country_id", value === "all" ? null : Number(value))
          }
        >
          <SelectTrigger id="country-select" aria-label={t("country")}>
            <SelectValue placeholder={loadingCountries ? tCommon("loading") : t("any")} />
            {loadingCountries && <Loader2 className="size-3 animate-spin" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("any")}</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={String(country.id)}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city-select">{t("city")}</Label>
        <Select
          value={values.city_id ? String(values.city_id) : "all"}
          onValueChange={(value) =>
            update("city_id", value === "all" ? null : Number(value))
          }
          disabled={!values.country_id}
        >
          <SelectTrigger id="city-select" aria-label={t("city")}>
            <SelectValue
              placeholder={
                !values.country_id
                  ? t("pickCountryFirst")
                  : loadingCities
                    ? tCommon("loading")
                    : t("any")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("any")}</SelectItem>
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
          <Label htmlFor="rooms-select">{t("beds")}</Label>
          <Select
            value={values.rooms || "all"}
            onValueChange={(value) => update("rooms", value === "all" ? "" : value)}
          >
            <SelectTrigger id="rooms-select" aria-label={t("beds")}>
              <SelectValue placeholder={t("any")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("any")}</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms-select">{t("baths")}</Label>
          <Select
            value={values.bathrooms || "all"}
            onValueChange={(value) => update("bathrooms", value === "all" ? "" : value)}
          >
            <SelectTrigger id="bathrooms-select" aria-label={t("baths")}>
              <SelectValue placeholder={t("any")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("any")}</SelectItem>
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
            <Label htmlFor="min-price">{t("minPrice")}</Label>
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
            <Label htmlFor="max-price">{t("maxPrice")}</Label>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder={t("any")}
              value={values.max_price}
              onChange={(event) => update("max_price", event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sort-select">{t("sortBy")}</Label>
        <Select value={values.sort} onValueChange={(value) => update("sort", value)}>
          <SelectTrigger id="sort-select" aria-label={t("sortBy")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">{t("sort.newest")}</SelectItem>
            <SelectItem value="created_at:asc">{t("sort.oldest")}</SelectItem>
            <SelectItem value="price:asc">{t("sort.priceAsc")}</SelectItem>
            <SelectItem value="price:desc">{t("sort.priceDesc")}</SelectItem>
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
        {t("clear")}
      </Button>
    </div>
  )
}
