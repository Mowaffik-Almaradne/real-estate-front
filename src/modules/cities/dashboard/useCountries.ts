"use client"

import { useCallback, useEffect, useState } from "react"

import { getCountries as apiGetCountries, type Country } from "lib/api"

interface CountriesState {
  countries: Country[]
  selectedCountry: Country | null
  loading: boolean
  error: string | null
}

interface UseCountriesResult extends CountriesState {
  loadCountries: () => Promise<void>
  selectCountry: (country: Country) => void
  addCountry: (country: Country) => void
  updateCountry: (country: Country) => void
  removeCountry: (id: number) => void
}

/**
 * `/api/search/countries` returns the full list (no pagination meta).
 * Do not treat it as infinite-scroll — that duplicated the same page.
 */
export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCountries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiGetCountries()
      const list = response.data

      setCountries(list)
      setSelectedCountry((current) => {
        if (current && list.some((c) => c.id === current.id)) return current
        return list[0] ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load countries")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadCountries()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [loadCountries])

  const selectCountry = useCallback((country: Country) => {
    setSelectedCountry(country)
  }, [])

  const addCountry = useCallback((country: Country) => {
    setCountries((prev) => [...prev, country])
  }, [])

  const updateCountry = useCallback((country: Country) => {
    setCountries((prev) => prev.map((c) => (c.id === country.id ? country : c)))
    setSelectedCountry((current) =>
      current?.id === country.id ? country : current
    )
  }, [])

  const removeCountry = useCallback((id: number) => {
    setCountries((prev) => prev.filter((c) => c.id !== id))
    setSelectedCountry((current: Country | null) =>
      current?.id === id ? null : current
    )
  }, [])

  return {
    countries,
    selectedCountry,
    loading,
    error,
    loadCountries,
    selectCountry,
    addCountry,
    updateCountry,
    removeCountry,
  }
}
