"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "components/ui/button"
import { DashboardLayout } from "components/layout/DashboardLayout"
import {
  CountryPanel,
  CityPanel,
  useCountries,
  useCities,
} from "src/modules/cities/dashboard"
import type { City } from "@/types/dto"
import type { Country } from "lib/api"

export default function CitiesPage() {
  const tCity = useTranslations("city")

  const {
    countries,
    selectedCountry,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    loadCountries,
    selectCountry,
    addCountry,
    updateCountry,
    removeCountry,
  } = useCountries()

  const {
    cities,
    loading: citiesLoading,
    loadCities,
    addCity,
    updateCity,
    removeCity,
  } = useCities()

  const countryListRef = useRef<HTMLDivElement>(null)

  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)

  const handleCountryScroll = useCallback(() => {
    if (
      countryListRef.current &&
      !loading &&
      !loadingMore &&
      hasMore
    ) {
      const { scrollTop, scrollHeight, clientHeight } = countryListRef.current
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        void loadCountries(page + 1)
      }
    }
  }, [loading, loadingMore, page, hasMore, loadCountries])

  const handleCountryClick = (country: Country) => {
    selectCountry(country)
    void loadCities(country.id)
  }

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country)
    setCountryDialogOpen(true)
  }

  const handleCountrySaved = (country: Country, isEdit: boolean) => {
    if (isEdit) updateCountry(country)
    else addCountry(country)
    setEditingCountry(null)
  }

  const handleDeleteCountry = (id: number) => {
    removeCountry(id)
    if (selectedCountry?.id === id) {
      removeCity(id)
    }
  }

  const handleAddCountry = () => {
    setEditingCountry(null)
    setCountryDialogOpen(true)
  }

  const handleEditCity = (city: City) => {
    setEditingCity(city)
    setCityDialogOpen(true)
  }

  const handleCitySaved = (city: City, isEdit: boolean) => {
    if (isEdit) updateCity(city)
    else addCity(city)
    setEditingCity(null)
  }

  const handleAddCity = () => {
    setEditingCity(null)
    setCityDialogOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout title={tCity("titleFull")}>
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
              <h3 className="text-sm font-semibold text-foreground">
                Failed to load countries
              </h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => void loadCountries(1)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Try again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={tCity("titleFull")}>
      <div className="flex flex-col gap-6 lg:flex-row">
        <CountryPanel
          countries={countries}
          selected={selectedCountry}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          listScrollRef={countryListRef}
          onScroll={handleCountryScroll}
          onSelect={handleCountryClick}
          onEdit={handleEditCountry}
          onDelete={handleDeleteCountry}
          onLoadMore={() => void loadCountries(page + 1)}
          dialogOpen={countryDialogOpen}
          editing={editingCountry}
          onDialogOpenChange={(open: boolean) => {
            setCountryDialogOpen(open)
            if (!open) setEditingCountry(null)
            if (open) handleAddCountry()
          }}
          onSaved={handleCountrySaved}
        />

        <CityPanel
          cities={cities}
          countries={countries}
          selectedCountry={selectedCountry}
          loading={citiesLoading}
          dialogOpen={cityDialogOpen}
          editing={editingCity}
          onDialogOpenChange={(open: boolean) => {
            setCityDialogOpen(open)
            if (!open) setEditingCity(null)
            if (open) handleAddCity()
          }}
          onEdit={handleEditCity}
          onDelete={removeCity}
          onSaved={handleCitySaved}
        />
      </div>
    </DashboardLayout>
  )
}