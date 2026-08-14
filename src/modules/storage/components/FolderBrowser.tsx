"use client"

import { useMemo } from "react"
import { ChevronRight, FileText, Folder as FolderIcon, Image as ImageIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { File, Folder } from "../types"
import { useStorageTranslations } from "../locales/useStorageTranslations"

interface FolderBrowserProps {
  childFolders: Folder[]
  files: File[]
  loading: boolean
  error: string | null
  onOpenFolder?: (folder: Folder) => void
  onRenameFolder?: (folder: Folder) => void
  onDeleteFolder?: (folder: Folder) => void
  onNewFolder?: () => void
  onRenameFile?: (file: File) => void
  onDeleteFile?: (file: File) => void
  onEditFile?: (file: File) => void
  onOpenFile?: (file: File) => void
}

export function FolderBrowser({
  childFolders,
  files,
  loading,
  error,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onNewFolder,
  onRenameFile,
  onDeleteFile,
  onEditFile,
  onOpenFile,
}: FolderBrowserProps) {
  const { t } = useStorageTranslations()

  const total = childFolders.length + files.length

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  if (total === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {t("empty.folder")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3" data-testid="folder-browser">
      {childFolders.length > 0 && (
        <div className="space-y-2">
          {childFolders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              onOpen={onOpenFolder}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
              onNewSubfolder={onNewFolder}
            />
          ))}
        </div>
      )}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onOpen={onOpenFile}
              onRename={onRenameFile}
              onDelete={onDeleteFile}
              onEdit={onEditFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderRowProps {
  folder: Folder
  onOpen?: (folder: Folder) => void
  onRename?: (folder: Folder) => void
  onDelete?: (folder: Folder) => void
  onNewSubfolder?: () => void
}

function FolderRow({
  folder,
  onOpen,
  onRename,
  onDelete,
}: FolderRowProps) {
  const { t } = useStorageTranslations()
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => onOpen?.(folder)}
      data-testid={`folder-row-${folder.id}`}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <FolderIcon className="size-5 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{folder.name}</p>
          {folder.is_protected && (
            <Badge variant="outline" className="mt-0.5">
              Protected
            </Badge>
          )}
        </div>
        {onRename && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRename(folder)
            }}
          >
            {t("actions.rename")}
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(folder)
            }}
          >
            {t("actions.delete")}
          </Button>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

interface FileRowProps {
  file: File
  onOpen?: (file: File) => void
  onRename?: (file: File) => void
  onDelete?: (file: File) => void
  onEdit?: (file: File) => void
}

function FileRow({ file, onOpen, onRename, onDelete, onEdit }: FileRowProps) {
  const { t } = useStorageTranslations()
  const isImage = file.type === "image"

  const Icon = useMemo(() => (isImage ? ImageIcon : FileText), [isImage])

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => onOpen?.(file)}
      data-testid={`file-row-${file.id}`}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <Icon className="size-5 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.size_readable ?? `${file.size ?? 0} B`} · {file.type}
          </p>
        </div>
        {onEdit && file.type === "text" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(file)
            }}
          >
            {t("actions.edit")}
          </Button>
        )}
        {onRename && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRename(file)
            }}
          >
            {t("actions.rename")}
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(file)
            }}
          >
            {t("actions.delete")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
