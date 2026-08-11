"use client"

import { useCallback, useState } from "react"

import { getCitiesByCountry } from "lib/api"
import type { City } from "@/types/dto"

interface UseCitiesResult {
  cities: City[]
  loading: boolean
  loadCities: (countryId: number) => Promise<void>
  addCity: (city: City) => void
  updateCity: (city: City) => void
  removeCity: (id: number) => void
  resetCities: () => void
}

export function useCities(): UseCitiesResult {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)

  const loadCities = useCallback(async (countryId: number) => {
    try {
      setLoading(true)
      const data = await getCitiesByCountry(countryId)
      setCities(data)
    } catch (err) {
      console.error("Failed to load cities:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addCity = useCallback((city: City) => {
    setCities((prev) => [...prev, city])
  }, [])

  const updateCity = useCallback((city: City) => {
    setCities((prev) => prev.map((c) => (c.id === city.id ? city : c)))
  }, [])

  const removeCity = useCallback((id: number) => {
    setCities((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const resetCities = useCallback(() => setCities([]), [])

  return {
    cities,
    loading,
    loadCities,
    addCity,
    updateCity,
    removeCity,
    resetCities,
  }
}