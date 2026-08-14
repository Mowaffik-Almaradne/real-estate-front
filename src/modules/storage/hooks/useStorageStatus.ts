"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { storageService } from "../services/storageService"
import type { StoragePackage, StorageStatus } from "../types"

export interface UseStorageStatusResult {
  status: StorageStatus | null
  packages: StoragePackage[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  upgrade: (packageType: StorageStatus["package_type"]) => Promise<StorageStatus | null>
}

export function useStorageStatus(): UseStorageStatusResult {
  const [status, setStatus] = useState<StorageStatus | null>(null)
  const [packages, setPackages] = useState<StoragePackage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statusResponse, packagesResponse] = await Promise.all([
        storageService.status(),
        storageService.packages(),
      ])
      setStatus(statusResponse)
      setPackages(packagesResponse)
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load storage info"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const upgrade = useCallback(
    async (
      packageType: StorageStatus["package_type"]
    ): Promise<StorageStatus | null> => {
      try {
        const next = await storageService.upgrade({ package_type: packageType })
        setStatus(next)
        return next
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to upgrade storage"
        setError(message)
        return null
      }
    },
    []
  )

  return { status, packages, loading, error, refresh, upgrade }
}
