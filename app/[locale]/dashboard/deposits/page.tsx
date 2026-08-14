"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { Pagination } from "components/ui/pagination"

import { ApiClientError } from "@/lib/apiClient"
import type { ApiPagination } from "@/types/common"

import {
  depositService,
  isDepositAccessError,
} from "src/modules/deposits/services/depositService"
import { DepositFiltersBar } from "src/modules/deposits/components/DepositFiltersBar"
import { DepositList } from "src/modules/deposits/components/DepositList"
import { CreateDepositButton } from "src/modules/deposits/components/CreateDepositDialog"
import { getDepositLabel } from "src/modules/deposits/labels"
import {
  DEPOSIT_PERSPECTIVE,
  type DepositPerspective,
} from "src/modules/deposits/types/enums"
import type {
  DepositDto,
  DepositFilters,
} from "src/modules/deposits/types/dto"

type Tab = "buyer" | "seller"

export default function DepositsPage() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)

  const [tab, setTab] = useState<Tab>("buyer")
  const [filters, setFilters] = useState<DepositFilters>({ page: 1, perPage: 15 })
  const [deposits, setDeposits] = useState<DepositDto[]>([])
  const [pagination, setPagination] = useState<ApiPagination>({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: null,
    to: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState<{
    permission: "deposits.list" | "deposits.create"
  } | null>(null)

  const perspective: DepositPerspective =
    tab === "buyer" ? DEPOSIT_PERSPECTIVE.buyer : DEPOSIT_PERSPECTIVE.seller

  const fetchList = useCallback(
    async (activeFilters: DepositFilters, perspective: DepositPerspective) => {
      setLoading(true)
      setError(null)
      try {
        const response =
          perspective === "buyer"
            ? await depositService.listMine(activeFilters)
            : await depositService.listSales(activeFilters)
        setDeposits(response.data)
        setPagination(response.pagination)
        setPermissionDenied(null)
      } catch (err) {
        if (isDepositAccessError(err)) {
          setPermissionDenied({ permission: "deposits.list" })
          setDeposits([])
          setPagination({
            total: 0,
            per_page: 15,
            current_page: 1,
            last_page: 1,
            from: null,
            to: null,
          })
        } else if (err instanceof ApiClientError) {
          setError(err.message)
          setDeposits([])
        } else {
          setError("Failed to load deposits")
          setDeposits([])
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchList(filters, perspective)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [fetchList, filters, perspective])

  const headerActions = useMemo(
    () => (
      <CreateDepositButton
        onCreated={(created) => {
          setDeposits((current) => [created, ...current])
        }}
      />
    ),
    []
  )

  return (
    <DashboardLayout title={label("deposits.title")} actions={headerActions}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{label("deposits.subtitle")}</p>

        <div className="flex items-center gap-1 rounded-md border p-0.5 w-fit">
          <button
            type="button"
            className={
              "px-3 py-1.5 text-sm rounded-sm transition-colors " +
              (tab === "buyer"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-accent")
            }
            onClick={() => {
              setTab("buyer")
              setFilters((prev) => ({ ...prev, page: 1, perPage: 15 }))
            }}
          >
            {label("deposits.tab.buyer")}
          </button>
          <button
            type="button"
            className={
              "px-3 py-1.5 text-sm rounded-sm transition-colors " +
              (tab === "seller"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-accent")
            }
            onClick={() => {
              setTab("seller")
              setFilters((prev) => ({ ...prev, page: 1, perPage: 15 }))
            }}
          >
            {label("deposits.tab.seller")}
          </button>
        </div>

        {permissionDenied && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            {label("deposits.permission.denied", {
              permission: permissionDenied.permission,
            })}
          </div>
        )}

        <DepositFiltersBar
          initial={filters}
          loading={loading}
          onApply={(next) => setFilters({ ...next, page: 1, perPage: 15 })}
        />

        <DepositList
          deposits={deposits}
          loading={loading}
          error={error}
          perspective={perspective}
          onUpdated={(updated) => {
            setDeposits((current) =>
              current.map((d) => (d.id === updated.id ? updated : d))
            )
          }}
          onDeleted={(id) => {
            setDeposits((current) => current.filter((d) => d.id !== id))
          }}
        />
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page || 15}
          disabled={loading}
          onPageChange={(page) =>
            setFilters((prev) => ({ ...prev, page, perPage: 15 }))
          }
        />
      </div>
    </DashboardLayout>
  )
}
