"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Building2,
  Loader2
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCountries, getCities, Country, City } from "@/lib/api"

export default function CitiesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [countryName, setCountryName] = useState("")
  const [cityName, setCityName] = useState("")
  const [cityCountryId, setCityCountryId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [countriesData, citiesData] = await Promise.all([
        getCountries(),
        getCities()
      ])
      setCountries(countriesData)
      setCities(citiesData)
      if (countriesData.length > 0 && !selectedCountry) {
        setSelectedCountry(countriesData[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const getCityCount = (countryId: number) => {
    return cities.filter((c) => c.country_id === countryId).length
  }

  const filteredCities = selectedCountry
    ? cities.filter((c) => c.country_id === selectedCountry.id)
    : []

  const handleAddCountry = () => {
    setEditingCountry(null)
    setCountryName("")
    setCountryDialogOpen(true)
  }

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country)
    setCountryName(country.name)
    setCountryDialogOpen(true)
  }

  const handleDeleteCountry = (countryId: number) => {
    setCities(cities.filter((c) => c.country_id !== countryId))
    setCountries(countries.filter((c) => c.id !== countryId))
    if (selectedCountry?.id === countryId) {
      setSelectedCountry(countries.find((c) => c.id !== countryId) || null)
    }
  }

  const handleSaveCountry = () => {
    if (!countryName.trim()) return

    if (editingCountry) {
      setCountries(
        countries.map((c) =>
          c.id === editingCountry.id ? { ...c, name: countryName } : c
        )
      )
    } else {
      const newCountry: Country = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: countryName,
      }
      setCountries([...countries, newCountry])
    }
    setCountryDialogOpen(false)
    setCountryName("")
  }

  const handleAddCity = () => {
    setEditingCity(null)
    setCityName("")
    setCityCountryId(selectedCountry?.id?.toString() || "")
    setCityDialogOpen(true)
  }

  const handleEditCity = (city: City) => {
    setEditingCity(city)
    setCityName(city.name)
    setCityCountryId(city.country_id?.toString() || "")
    setCityDialogOpen(true)
  }

  const handleDeleteCity = (cityId: number) => {
    setCities(cities.filter((c) => c.id !== cityId))
  }

  const handleSaveCity = () => {
    if (!cityName.trim() || !cityCountryId) return

    const countryIdNum = parseInt(cityCountryId)

    if (editingCity) {
      setCities(
        cities.map((c) =>
          c.id === editingCity.id ? { ...c, name: cityName, country_id: countryIdNum } : c
        )
      )
      if (editingCity.country_id !== countryIdNum && selectedCountry?.id === editingCity.country_id) {
        setSelectedCountry(countries.find((c) => c.id === countryIdNum) || null)
      }
    } else {
      const newCity: City = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: cityName,
        country_id: countryIdNum,
        state_provianc: null,
        postal_code: null,
        is_active: true,
      }
      setCities([...cities, newCity])
    }
    setCityDialogOpen(false)
    setCityName("")
  }

  if (loading) {
    return (
      <DashboardLayout title="Countries & Cities">
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Countries & Cities">
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-destructive">
            <p>Error: {error}</p>
            <Button onClick={loadData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Countries & Cities">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[30%] min-w-[280px] flex flex-col rounded-xl bg-card border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-muted-foreground" />
              <h2 className="font-semibold">Countries</h2>
            </div>
            <Dialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddCountry} className="w-full sm:w-auto">
                  <Plus className="mr-1 size-4" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCountry ? "Edit Country" : "Add Country"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCountry
                      ? "Update the country name below."
                      : "Enter the country name below."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Country name"
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveCountry()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCountryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCountry}>
                    {editingCountry ? "Save Changes" : "Add Country"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
            {countries.map((country) => (
              <Card
                key={country.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCountry?.id === country.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedCountry(country)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${
                        selectedCountry?.id === country.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <Globe
                        className={`size-4 ${
                          selectedCountry?.id === country.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{country.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCityCount(country.id)} cities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCountry(country)
                      }}
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCountry(country.id)
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col rounded-xl bg-card border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-muted-foreground" />
              <h2 className="font-semibold">
                {selectedCountry
                  ? `Cities in ${selectedCountry.name}`
                  : "Select a country"}
              </h2>
            </div>
            <Dialog open={cityDialogOpen} onOpenChange={setCityDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={!selectedCountry}
                  onClick={handleAddCity}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-1 size-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCity ? "Edit City" : "Add City"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCity
                      ? "Update the city details below."
                      : "Enter the city name below."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="City name"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveCity()}
                  />
                  <Select value={cityCountryId} onValueChange={setCityCountryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCityDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveCity}
                    disabled={!cityName.trim() || !cityCountryId}
                  >
                    {editingCity ? "Save Changes" : "Add City"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
            {selectedCountry ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredCities.map((city) => (
                  <Card
                    key={city.id}
                    className="border-border hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                          <Building2 className="size-4 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm truncate">{city.name}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleEditCity(city)}
                        >
                          <Edit className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCity(city.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <MapPin className="size-12 mb-3 opacity-50" />
                <p>Select a country to view its cities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}