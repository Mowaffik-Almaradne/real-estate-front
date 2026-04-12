"use client"

import { useState } from "react"
import { MapPin, Plus, Search, Edit, Trash2, MoreVertical } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface City {
  id: string
  name: string
  state: string
  properties: number
  activeListings: number
  status: "active" | "inactive"
}

const mockCities: City[] = [
  { id: "1", name: "New York", state: "NY", properties: 1250, activeListings: 342, status: "active" },
  { id: "2", name: "Los Angeles", state: "CA", properties: 987, activeListings: 256, status: "active" },
  { id: "3", name: "Chicago", state: "IL", properties: 654, activeListings: 189, status: "active" },
  { id: "4", name: "Houston", state: "TX", properties: 543, activeListings: 167, status: "active" },
  { id: "5", name: "Phoenix", state: "AZ", properties: 432, activeListings: 145, status: "active" },
  { id: "6", name: "Miami", state: "FL", properties: 398, activeListings: 124, status: "active" },
  { id: "7", name: "Seattle", state: "WA", properties: 321, activeListings: 98, status: "active" },
  { id: "8", name: "Denver", state: "CO", properties: 287, activeListings: 87, status: "inactive" },
]

export default function CitiesPage() {
  const [cities] = useState<City[]>(mockCities)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout title="Cities">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Cities</h2>
            <p className="text-muted-foreground">
              Manage your cities and territories.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            Add City
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <Card key={city.id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Properties</p>
                    <p className="font-medium">{city.properties}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Listings</p>
                    <p className="font-medium">{city.activeListings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p
                      className={`text-xs font-medium ${
                        city.status === "active"
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {city.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No cities found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}