"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import {
  Card,
  CardContent,
} from "components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"
import { Switch } from "components/ui/switch"
import { getCountries as apiGetCountries, getCitiesByCountry, saveCountry, saveCity, Country, City } from "lib/api"

export default function CitiesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [countryPage, setCountryPage] = useState(1)
  const [countryHasMore, setCountryHasMore] = useState(true)
  const countryListRef = useRef<HTMLDivElement>(null)
  
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [countryName, setCountryName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [countryPhoneCode, setCountryPhoneCode] = useState("")
  const [countryIsActive, setCountryIsActive] = useState(true)
  const [cityName, setCityName] = useState("")
  const [cityCountryId, setCityCountryId] = useState("")
  const [cityStateProvince, setCityStateProvince] = useState("")
  const [cityPostalCode, setCityPostalCode] = useState("")
  const [cityIsActive, setCityIsActive] = useState(true)

  useEffect(() => {
    loadCountries(1)
  }, [])

  const loadCountries = async (page: number = 1) => {
    if (page > 1 && (!countryHasMore || loadingMore)) return
    
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      const response = await apiGetCountries(page)
      
      if (page === 1) {
        setCountries(response.data)
        if (response.data.length > 0) {
          setSelectedCountry(response.data[0])
        }
      } else {
        setCountries((prev) => [...prev, ...response.data])
      }
      
      setCountryPage(page)
      setCountryHasMore(response.pagination ? page < response.pagination.last_page : response.data.length > 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load countries")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleCountryScroll = useCallback(() => {
    if (countryListRef.current && !loading && !loadingMore && countryHasMore) {
      const { scrollTop, scrollHeight, clientHeight } = countryListRef.current
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadCountries(countryPage + 1)
      }
    }
  }, [loading, loadingMore, countryPage, countryHasMore])

  const loadCities = async (countryId: number) => {
    try {
      setCitiesLoading(true)
      const citiesData = await getCitiesByCountry(countryId)
      setCities(citiesData)
    } catch (err) {
      console.error("Failed to load cities:", err)
    } finally {
      setCitiesLoading(false)
    }
  }

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country)
    loadCities(country.id)
  }

  const handleAddCountry = () => {
    setEditingCountry(null)
    setCountryName("")
    setCountryCode("")
    setCountryPhoneCode("")
    setCountryIsActive(true)
    setCountryDialogOpen(true)
  }

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country)
    setCountryName(country.name)
    setCountryCode(country.code || "")
    setCountryPhoneCode(country.phone_code || "")
    setCountryIsActive(country.is_active)
    setCountryDialogOpen(true)
  }

  const handleDeleteCountry = (countryId: number) => {
    setCities(cities.filter((c) => c.country_id !== countryId))
    setCountries(countries.filter((c) => c.id !== countryId))
    if (selectedCountry?.id === countryId) {
      setSelectedCountry(countries.find((c) => c.id !== countryId) || null)
    }
  }

  const handleSaveCountry = async () => {
    if (!countryName.trim()) return

    try {
      const response = await saveCountry(
        countryName,
        countryCode || null,
        countryPhoneCode || null,
        countryIsActive,
        editingCountry?.id
      )
      if (response.success) {
        if (editingCountry) {
          setCountries(
            countries.map((c) =>
              c.id === editingCountry.id ? response.data : c
            )
          )
        } else {
          setCountries([...countries, response.data])
        }
        setCountryDialogOpen(false)
        setCountryName("")
        setCountryCode("")
        setCountryPhoneCode("")
        setCountryIsActive(true)
      }
    } catch (err) {
      console.error("Failed to save country:", err)
    }
  }

  const handleAddCity = () => {
    setEditingCity(null)
    setCityName("")
    setCityCountryId(selectedCountry?.id?.toString() || "")
    setCityStateProvince("")
    setCityPostalCode("")
    setCityIsActive(true)
    setCityDialogOpen(true)
  }

  const handleEditCity = (city: City) => {
    setEditingCity(city)
    setCityName(city.name)
    setCityCountryId(city.country_id?.toString() || "")
    setCityStateProvince(city.state_province || "")
    setCityPostalCode(city.postal_code || "")
    setCityIsActive(city.is_active)
    setCityDialogOpen(true)
  }

  const handleDeleteCity = (cityId: number) => {
    setCities(cities.filter((c) => c.id !== cityId))
  }

  const handleSaveCity = async () => {
    if (!cityName.trim() || !cityCountryId) return

    const countryIdNum = parseInt(cityCountryId)

    try {
      const response = await saveCity(
        cityName,
        countryIdNum,
        cityStateProvince || null,
        cityPostalCode || null,
        cityIsActive,
        editingCity?.id
      )
      if (response.success) {
        if (editingCity) {
          setCities(
            cities.map((c) =>
              c.id === editingCity.id ? response.data : c
            )
          )
        } else {
          setCities([...cities, response.data])
        }
        setCityDialogOpen(false)
        setCityName("")
        setCityStateProvince("")
        setCityPostalCode("")
        setCityIsActive(true)
      }
    } catch (err) {
      console.error("Failed to save city:", err)
    }
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
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-4">
          <div
            role="alert"
            aria-live="assertive"
            className="flex flex-col items-center gap-4 max-w-sm text-center p-6 rounded-[6px] bg-destructive/5 border border-destructive/20"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Failed to load countries</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => loadCountries(1)} variant="outline" size="sm">
              <RefreshCw className="mr-1.5 size-3.5" />
              Try again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Countries & Cities">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[30%] min-w-[280px] flex flex-col rounded-[6px] bg-card border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-3">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Countries</h2>
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
                      ? "Update the country details below."
                      : "Enter the country details below."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="Country name"
                      value={countryName}
                      onChange={(e) => setCountryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveCountry()}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Code</label>
                    <Input
                      placeholder="e.g. US"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Code</label>
                    <Input
                      placeholder="e.g. +1"
                      value={countryPhoneCode}
                      onChange={(e) => setCountryPhoneCode(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={countryIsActive}
                      onCheckedChange={setCountryIsActive}
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>
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

          <div 
            ref={countryListRef}
            onScroll={handleCountryScroll}
            className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh] lg:max-h-[calc(100vh-16rem)]"
          >
            {countries.map((country) => (
              <Card
                key={country.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCountry?.id === country.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleCountryClick(country)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-7 items-center justify-center rounded-[4px] ${
                        selectedCountry?.id === country.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <Globe
                        className={`size-3.5 ${
                          selectedCountry?.id === country.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{country.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {country.cities_count ?? 0} cities
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
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && !loadingMore && countryHasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-muted-foreground"
                onClick={() => loadCountries(countryPage + 1)}
              >
                Load more
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col rounded-[6px] bg-card border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 border-b border-border p-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">
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
                      : "Enter the city details below."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="City name"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveCity()}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country *</label>
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
                  <div>
                    <label className="text-sm font-medium">State/Province</label>
                    <Input
                      placeholder="State or province"
                      value={cityStateProvince}
                      onChange={(e) => setCityStateProvince(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Postal Code</label>
                    <Input
                      placeholder="Postal code"
                      value={cityPostalCode}
                      onChange={(e) => setCityPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cityIsActive}
                      onCheckedChange={setCityIsActive}
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>
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
              citiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {cities.map((city) => (
                  <Card
                    key={city.id}
                    className="border-border hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-7 items-center justify-center rounded-[4px] bg-muted shrink-0">
                          <Building2 className="size-3.5 text-muted-foreground" />
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
              )
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