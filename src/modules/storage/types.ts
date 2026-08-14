export const FILE_TYPES = ["text", "image"] as const

export type FileType = (typeof FILE_TYPES)[number]

export const STORAGE_PACKAGE_TYPES = [
  "free",
  "small",
  "medium",
  "large",
  "max",
] as const

export type StoragePackageType = (typeof STORAGE_PACKAGE_TYPES)[number]

export const FOLDER_NAME_MAX = 255
export const FILE_NAME_MAX = 255
export const TEXT_FILE_CONTENT_MAX = 5_000

export interface Folder {
  id: number
  name: string
  user_id: number
  parent_id: number | null
  parent?: Folder | null
  children?: Folder[] | null
  files?: File[] | null
  files_count?: number
  is_protected?: boolean
  is_system?: boolean
  property_id?: number | null
  created_at: string
  updated_at?: string
}

export interface FolderBreadcrumb {
  id: number
  name: string
}

export interface FolderContents {
  folder: Folder
  children: Folder[]
  files: File[]
  breadcrumbs: FolderBreadcrumb[]
  storage: StorageStatus
}

export interface File {
  id: number
  name: string
  type: FileType
  mime_type?: string | null
  size?: number
  size_readable?: string
  url?: string | null
  thumb_url?: string | null
  folder_id: number | null
  user_id: number
  content?: string | null
  created_at: string
  updated_at?: string
}

// Distinct name to avoid collisions with the DOM `File` global.
export type StorageFile = File

export interface StorageStatus {
  quota_bytes: number
  quota_readable: string
  used_bytes: number
  used_readable: string
  remaining_bytes: number
  used_percentage: number
  package_type: StoragePackageType
  is_exceeded: boolean
  is_near_limit: boolean
  can_upload: boolean
  available_packages: StoragePackage[]
}

export interface StoragePackage {
  type: StoragePackageType
  name: string
  quota_bytes: number
  quota_readable: string
  price?: number | null
  currency?: string | null
  is_current?: boolean
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateFolderRequest {
  name: string
}

export interface MoveFolderRequest {
  parent_id: number | null
}

export interface CreateTextFileRequest {
  name: string
  content: string
  folder_id?: number | null
}

export interface UpdateTextFileRequest {
  name?: string
  content?: string
}

export interface MoveFileRequest {
  folder_id: number | null
}

export interface RenameFileRequest {
  name: string
}

export interface UpgradeStorageRequest {
  package_type: StoragePackageType
}

export interface RenameFolderResponse {
  folder: Folder
}

export interface FolderListResponse {
  folders: Folder[]
}

export interface FolderListFilters {
  parent_id?: number | null
}
