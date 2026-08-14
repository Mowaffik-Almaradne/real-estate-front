"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  FolderBrowser,
  FolderDialog,
  StorageConfirmDialog,
  StorageQuotaCard,
  TextFileDialog,
  UploadImageDialog,
  fileService,
  folderService,
  storageService,
  useFolder,
  useRootFolders,
  useStorageStatus,
  useStorageTranslations,
  type CreateFolderValues,
  type CreateTextFileValues,
  type File,
  type Folder,
  type RenameFolderValues,
  type StorageStatus,
  type UpdateTextFileValues,
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

export default function StorageDashboardPage() {
  const { t } = useStorageTranslations()
  const [folderId, setFolderId] = useState<number | null>(null)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [folderEditing, setFolderEditing] = useState<Folder | null>(null)
  const [folderParent, setFolderParent] = useState<Folder | null>(null)
  const [fileFormOpen, setFileFormOpen] = useState(false)
  const [fileEditing, setFileEditing] = useState<File | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteFolder, setDeleteFolder] = useState<Folder | null>(null)
  const [deletingFolder, setDeletingFolder] = useState(false)
  const [deleteFile, setDeleteFile] = useState<File | null>(null)
  const [deletingFile, setDeletingFile] = useState(false)
  const [upgradingPackage, setUpgradingPackage] =
    useState<StorageStatus["package_type"] | null>(null)

  const rootFolders = useRootFolders()
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

  const availableParents = folderId == null ? rootFolders.folders : folder.children

  const handleOpenFolder = (next: Folder) => {
    setFolderId(next.id)
  }

  const handleBackToRoot = () => {
    setFolderId(null)
  }

  const handleNewFolder = () => {
    setFolderEditing(null)
    setFolderParent(folder.folder)
    setFolderFormOpen(true)
  }

  const handleRenameFolder = (target: Folder) => {
    setFolderEditing(target)
    setFolderParent(null)
    setFolderFormOpen(true)
  }

  const handleDeleteFolder = (target: Folder) => {
    setDeleteFolder(target)
  }

  const handleFolderSubmit = async (
    payload: CreateFolderValues | RenameFolderValues
  ) => {
    if (folderEditing) {
      await folderService.rename(folderEditing.id, payload as RenameFolderValues)
      toast.success(t("toast.folderRenamed"))
    } else {
      await folderService.create(payload as CreateFolderValues)
      toast.success(t("toast.folderCreated"))
    }
    if (folderId != null) {
      void folder.refresh()
    } else {
      void rootFolders.refresh()
    }
  }

  const handleDeleteFolderConfirm = async () => {
    if (!deleteFolder) return
    setDeletingFolder(true)
    try {
      await folderService.remove(deleteFolder.id)
      toast.success(t("toast.folderDeleted"))
      setDeleteFolder(null)
      if (folderId === deleteFolder.id) {
        setFolderId(null)
      } else {
        if (folderId != null) void folder.refresh()
        else void rootFolders.refresh()
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errorLoading")
      toast.error(message)
    } finally {
      setDeletingFolder(false)
    }
  }

  const handleNewTextFile = () => {
    setFileEditing(null)
    setFileFormOpen(true)
  }

  const handleEditFile = (file: File) => {
    setFileEditing(file)
    setFileFormOpen(true)
  }

  const handleFileSubmit = async (
    payload: CreateTextFileValues | UpdateTextFileValues
  ) => {
    if (fileEditing) {
      await fileService.updateText(fileEditing.id, payload as UpdateTextFileValues)
      toast.success(t("toast.fileUpdated"))
    } else {
      await fileService.createText({
        ...(payload as CreateTextFileValues),
        folder_id: folderId,
      })
      toast.success(t("toast.fileCreated"))
    }
    if (folderId != null) void folder.refresh()
  }

  const handleDeleteFile = (file: File) => {
    setDeleteFile(file)
  }

  const handleDeleteFileConfirm = async () => {
    if (!deleteFile) return
    setDeletingFile(true)
    try {
      await fileService.remove(deleteFile.id)
      toast.success(t("toast.fileDeleted"))
      setDeleteFile(null)
      if (folderId != null) void folder.refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errorLoading")
      toast.error(message)
    } finally {
      setDeletingFile(false)
    }
  }

  const handleUploadImage = async (file: globalThis.File): Promise<unknown> => {
    await fileService.uploadImage(file, folderId)
    toast.success(t("toast.fileCreated"))
    if (folderId != null) void folder.refresh()
    void storage.refresh()
    return undefined
  }

  const handleUpgrade = async (packageType: StorageStatus["package_type"]) => {
    setUpgradingPackage(packageType)
    try {
      await storageService.upgrade({ package_type: packageType })
      toast.success(t("storage.upgradeSuccess"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errorLoading")
      toast.error(message)
    } finally {
      setUpgradingPackage(null)
    }
  }

  const breadcrumbs = folderId == null
    ? [{ id: 0, name: t("breadcrumbs.root") }]
    : [
        { id: 0, name: t("breadcrumbs.root") },
        ...folder.breadcrumbs.map((b) => ({ id: b.id, name: b.name })),
        { id: folder.folder?.id ?? 0, name: folder.folder?.name ?? "" },
      ]

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadOpen(true)}
              data-testid="storage-upload-image"
            >
              <Upload className="mr-1.5 size-4" />
              {t("actions.uploadImage")}
            </Button>
            <Button
              variant="outline"
              onClick={handleNewTextFile}
              disabled={storage.status?.is_exceeded}
              data-testid="storage-new-text-file"
            >
              <Plus className="mr-1.5 size-4" />
              {t("actions.newTextFile")}
            </Button>
            <Button
              onClick={handleNewFolder}
              data-testid="storage-new-folder"
            >
              <Plus className="mr-1.5 size-4" />
              {t("actions.newFolder")}
            </Button>
          </div>
        </div>

        <StorageQuotaCard
          status={storage.status}
          packages={storage.packages}
          loading={storage.loading}
          onUpgrade={handleUpgrade}
          upgrading={upgradingPackage}
        />

        <Card>
          <CardContent className="p-6">
            <nav
              className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.id}-${index}`} className="flex items-center gap-1">
                  {index > 0 && <span>/</span>}
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => {
                      if (index === 0) {
                        handleBackToRoot()
                      } else if (index < breadcrumbs.length - 1) {
                        setFolderId(crumb.id)
                      }
                    }}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </nav>

            {folderId != null && folder.loading && !folder.folder ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("common.loading")}
              </div>
            ) : (
              <FolderBrowser
                childFolders={folder.children}
                files={folder.files}
                loading={folderId != null ? folder.loading : rootFolders.loading}
                error={folderId != null ? folder.error : rootFolders.error}
                onOpenFolder={handleOpenFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onNewFolder={handleNewFolder}
                onRenameFile={(file) => handleEditFile(file)}
                onDeleteFile={handleDeleteFile}
                onEditFile={handleEditFile}
                onOpenFile={(file) => {
                  if (file.url && typeof window !== "undefined") {
                    window.open(file.url, "_blank")
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <FolderDialog
        open={folderFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFolderEditing(null)
            setFolderParent(null)
          }
          setFolderFormOpen(open)
        }}
        parentFolder={folderParent}
        editing={folderEditing}
        availableParents={availableParents}
        onSubmit={handleFolderSubmit}
      />

      <TextFileDialog
        open={fileFormOpen}
        onOpenChange={(open) => {
          if (!open) setFileEditing(null)
          setFileFormOpen(open)
        }}
        editing={fileEditing}
        onSubmit={handleFileSubmit}
      />

      <UploadImageDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        remainingBytes={storage.status?.remaining_bytes ?? null}
        onSubmit={handleUploadImage}
      />

      <StorageConfirmDialog
        open={Boolean(deleteFolder)}
        submitting={deletingFolder}
        title={t("delete.folderTitle")}
        description={t("delete.folderDescription")}
        protectedEntity={deleteFolder?.is_protected ?? false}
        confirmLabel={t("delete.confirm")}
        onOpenChange={(open) => !open && setDeleteFolder(null)}
        onConfirm={handleDeleteFolderConfirm}
      />

      <StorageConfirmDialog
        open={Boolean(deleteFile)}
        submitting={deletingFile}
        title={t("delete.fileTitle")}
        description={t("delete.fileDescription")}
        confirmLabel={t("delete.confirm")}
        onOpenChange={(open) => !open && setDeleteFile(null)}
        onConfirm={handleDeleteFileConfirm}
      />
    </DashboardLayout>
  )
}
