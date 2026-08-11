"use client"

import { useCallback, useEffect, useState } from "react"

import { getCountries as apiGetCountries, type Country } from "lib/api"

interface CountriesState {
  countries: Country[]
  selectedCountry: Country | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  page: number
  hasMore: boolean
}

interface UseCountriesResult extends CountriesState {
  loadCountries: (page?: number) => Promise<void>
  selectCountry: (country: Country) => void
  addCountry: (country: Country) => void
  updateCountry: (country: Country) => void
  removeCountry: (id: number) => void
}

export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadCountries = useCallback(
    async (nextPage: number = 1) => {
      if (nextPage > 1 && (!hasMore || loadingMore)) return

      try {
        if (nextPage === 1) setLoading(true)
        else setLoadingMore(true)
        setError(null)

        const response = await apiGetCountries(nextPage)

        if (nextPage === 1) {
          setCountries(response.data)
          if (response.data.length > 0) setSelectedCountry(response.data[0])
        } else {
          setCountries((prev) => [...prev, ...response.data])
        }

        setPage(nextPage)
        setHasMore(
          response.pagination
            ? nextPage < response.pagination.last_page
            : response.data.length > 0
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load countries")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [hasMore, loadingMore]
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadCountries(1)
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
    loadingMore,
    error,
    page,
    hasMore,
    loadCountries,
    selectCountry,
    addCountry,
    updateCountry,
    removeCountry,
  }
}