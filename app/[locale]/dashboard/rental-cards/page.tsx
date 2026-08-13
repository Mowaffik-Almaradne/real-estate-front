"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"

import { DashboardLayout } from "components/layout/DashboardLayout"

import { ApiClientError } from "@/lib/apiClient"

import { rentalCardService, isRentalCardAccessError } from "src/modules/rental-cards/services/rentalCardService"
import {
  RentalCardFiltersBar,
} from "src/modules/rental-cards/components/RentalCardFiltersBar"
import {
  RentalCardList,
} from "src/modules/rental-cards/components/RentalCardList"
import {
  CreateRentalCardButton,
} from "src/modules/rental-cards/components/CreateRentalCardDialog"
import { getRentalCardLabel } from "src/modules/rental-cards/labels"
import type {
  RentalCardDto,
  RentalCardFilters,
} from "src/modules/rental-cards/types/dto"

export default function RentalCardsPage() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)

  const [filters, setFilters] = useState<RentalCardFilters>({})
  const [cards, setCards] = useState<RentalCardDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const fetchList = useCallback(
    async (activeFilters: RentalCardFilters) => {
      setLoading(true)
      setError(null)
      try {
        const response = await rentalCardService.list(activeFilters)
        setCards(response.data)
        setPermissionDenied(false)
      } catch (err) {
        if (isRentalCardAccessError(err)) {
          setPermissionDenied(true)
          setCards([])
        } else if (err instanceof ApiClientError) {
          setError(err.message)
          setCards([])
        } else {
          setError("Failed to load rental cards")
          setCards([])
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchList(filters)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchList, filters])

  const headerActions = useMemo(
    () => (
      <CreateRentalCardButton
        onCreated={(card) => {
          setCards((current) => [card, ...current])
        }}
      />
    ),
    []
  )

  return (
    <DashboardLayout title={label("rentalCards.title")} actions={headerActions}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{label("rentalCards.subtitle")}</p>

        {permissionDenied && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            {label("rentalCards.permission.denied", { permission: "rental_cards.list" })}
          </div>
        )}

        <RentalCardFiltersBar
          initial={filters}
          loading={loading}
          onApply={(next) => setFilters(next)}
        />

        <RentalCardList
          cards={cards}
          loading={loading}
          error={error}
          onUpdated={(updated) => {
            setCards((current) =>
              current.map((c) => (c.id === updated.id ? updated : c))
            )
          }}
          onDeleted={(id) => {
            setCards((current) => current.filter((c) => c.id !== id))
          }}
        />
      </div>
    </DashboardLayout>
  )
}
