"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "components/layout/DashboardLayout"

import {
  FolderBrowser,
  StorageQuotaCard,
  useFolder,
  useStorageStatus,
  useStorageTranslations,
  type Folder,
} from "src/modules/storage"

function readFolderIdFromUrl(): number | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const value = params.get("folder")
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function writeFolderIdToUrl(folderId: number | null) {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  if (folderId == null) {
    url.searchParams.delete("folder")
  } else {
    url.searchParams.set("folder", String(folderId))
  }
  window.history.replaceState(null, "", url.toString())
}

export default function PublicStoragePage() {
  const { t } = useStorageTranslations()
  const [folderId, setFolderId] = useState<number | null>(null)
  const folder = useFolder(folderId)
  const storage = useStorageStatus()

  useEffect(() => {
    const initial = readFolderIdFromUrl()
    if (initial == null) return
    queueMicrotask(() => {
      setFolderId(initial)
    })
  }, [])

  useEffect(() => {
    writeFolderIdToUrl(folderId)
  }, [folderId])

  const handleOpenFolder = (next: Folder) => {
    setFolderId(next.id)
  }

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <StorageQuotaCard
          status={storage.status}
          packages={storage.packages}
          loading={storage.loading}
        />

        <Card>
          <CardContent className="p-6">
            {folderId != null && folder.loading && !folder.folder ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("common.loading")}
              </div>
            ) : folderId != null && folder.error ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <FolderBrowser
                childFolders={folder.children}
                files={folder.files}
                loading={folder.loading}
                error={folder.error}
                onOpenFolder={handleOpenFolder}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
