"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { folderService } from "../services/storageService"
import type {
  CreateFolderRequest,
  Folder,
  FolderContents,
  MoveFolderRequest,
  UpdateFolderRequest,
} from "../types"

export interface UseFolderResult {
  folder: Folder | null
  children: Folder[]
  files: FolderContents["files"]
  breadcrumbs: FolderContents["breadcrumbs"]
  storage: FolderContents["storage"] | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createSubfolder: (payload: CreateFolderRequest) => Promise<Folder | null>
  renameFolder: (id: number, payload: UpdateFolderRequest) => Promise<Folder | null>
  moveFolder: (id: number, payload: MoveFolderRequest) => Promise<Folder | null>
  deleteFolder: (id: number) => Promise<boolean>
}

export function useFolder(folderId: number | null): UseFolderResult {
  const [contents, setContents] = useState<FolderContents | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (folderId == null) {
      setContents(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await folderService.contents(folderId)
      setContents(data)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load folder"
      setError(message)
      setContents(null)
    } finally {
      setLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    void Promise.resolve().then(() => {
      void refresh()
    })
  }, [refresh])

  const createSubfolder = useCallback(
    async (payload: CreateFolderRequest): Promise<Folder | null> => {
      try {
        const created = await folderService.create(payload)
        await refresh()
        return created
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to create folder"
        setError(message)
        return null
      }
    },
    [refresh]
  )

  const renameFolder = useCallback(
    async (id: number, payload: UpdateFolderRequest): Promise<Folder | null> => {
      try {
        const updated = await folderService.renameViaPut(id, payload)
        await refresh()
        return updated
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to rename folder"
        setError(message)
        return null
      }
    },
    [refresh]
  )

  const moveFolder = useCallback(
    async (id: number, payload: MoveFolderRequest): Promise<Folder | null> => {
      try {
        const updated = await folderService.move(id, payload)
        await refresh()
        return updated
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to move folder"
        setError(message)
        return null
      }
    },
    [refresh]
  )

  const deleteFolder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await folderService.remove(id)
        await refresh()
        return true
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to delete folder"
        setError(message)
        return false
      }
    },
    [refresh]
  )

  return {
    folder: contents?.folder ?? null,
    children: contents?.children ?? [],
    files: contents?.files ?? [],
    breadcrumbs: contents?.breadcrumbs ?? [],
    storage: contents?.storage ?? null,
    loading,
    error,
    refresh,
    createSubfolder,
    renameFolder,
    moveFolder,
    deleteFolder,
  }
}
