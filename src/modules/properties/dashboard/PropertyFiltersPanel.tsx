"use client"

import { Search, X } from "lucide-react"

import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Combobox } from "components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import type { PropertyFiltersState } from "./usePropertyFilters"

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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
]

interface ComboboxOption {
  value: string
  label: string
}

interface PropertyFiltersPanelProps {
  filters: PropertyFiltersState
  onChange: <K extends keyof PropertyFiltersState>(
    key: K,
    value: PropertyFiltersState[K]
  ) => void
  onClear: () => void
  hasActive: boolean
  countries: ComboboxOption[]
  cities: ComboboxOption[]
  publishers: { id: number; name: string }[]
  onCountryChange: (value: string) => void
  onCountrySearch: (search: string) => void
  onCitySearch: (search: string) => void
  loadingCountry: boolean
  loadingCity: boolean
}

export function PropertyFiltersPanel({
  filters,
  onChange,
  onClear,
  hasActive,
  countries,
  cities,
  publishers,
  onCountryChange,
  onCountrySearch,
  onCitySearch,
  loadingCountry,
  loadingCity,
}: PropertyFiltersPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or keyword..."
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.property_type}
          onValueChange={(value) => onChange("property_type", value)}
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
          onValueChange={(value) => onChange("type_of_contract", value)}
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
          onValueChange={(value) => onChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Combobox
          value={filters.country_id}
          onValueChange={onCountryChange}
          placeholder="Country"
          options={countries}
          onSearch={onCountrySearch}
          loading={loadingCountry}
          searchPlaceholder="Search countries..."
        />

        <Combobox
          value={filters.city_id}
          onValueChange={(value) => onChange("city_id", value)}
          placeholder="City"
          options={cities}
          disabled={!filters.country_id}
          onSearch={onCitySearch}
          loading={loadingCity}
          searchPlaceholder="Search cities..."
        />

        <Select
          value={filters.publisher_id}
          onValueChange={(value) => onChange("publisher_id", value)}
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
          onValueChange={(value) => onChange("rooms", value)}
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
          onValueChange={(value) => onChange("bathrooms", value)}
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

      {hasActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-fit"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}