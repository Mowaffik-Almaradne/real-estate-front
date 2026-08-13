"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { folderService } from "../services/storageService"
import type { CreateFolderRequest, Folder } from "../types"

export interface UseRootFoldersResult {
  folders: Folder[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createFolder: (payload: CreateFolderRequest) => Promise<Folder | null>
}

export function useRootFolders(): UseRootFoldersResult {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await folderService.list({ parent_id: null })
      setFolders(items)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load folders"
      setError(message)
      setFolders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const createFolder = useCallback(
    async (payload: CreateFolderRequest): Promise<Folder | null> => {
      try {
        const created = await folderService.create(payload)
        setFolders((prev) => [...prev, created])
        return created
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : "Failed to create folder"
        setError(message)
        return null
      }
    },
    []
  )

  return { folders, loading, error, refresh, createFolder }
}
