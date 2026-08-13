export type {
  CreateFolderRequest,
  CreateTextFileRequest,
  File,
  FileType,
  Folder,
  FolderBreadcrumb,
  FolderContents,
  FolderListFilters,
  MoveFileRequest,
  MoveFolderRequest,
  RenameFileRequest,
  RenameFolderResponse,
  StoragePackage,
  StoragePackageType,
  StorageStatus,
  UpdateFolderRequest,
  UpdateTextFileRequest,
  UpgradeStorageRequest,
} from "./types"

export {
  FILE_NAME_MAX,
  FILE_TYPES,
  FOLDER_NAME_MAX,
  STORAGE_PACKAGE_TYPES,
  TEXT_FILE_CONTENT_MAX,
} from "./types"

export {
  folderService,
  fileService,
  storageService,
  StorageServiceError,
} from "./services/storageService"

export {
  createFolderSchema,
  createTextFileSchema,
  moveFileSchema,
  moveFolderSchema,
  renameFileSchema,
  renameFolderSchema,
  storagePackageTypeSchema,
  updateTextFileSchema,
  upgradeStorageSchema,
  type CreateFolderValues,
  type CreateTextFileValues,
  type MoveFileValues,
  type MoveFolderValues,
  type RenameFileValues,
  type RenameFolderValues,
  type UpdateTextFileValues,
  type UpgradeStorageValues,
} from "./schemas"

export { useFolder, type UseFolderResult } from "./hooks/useFolder"
export { useRootFolders, type UseRootFoldersResult } from "./hooks/useRootFolders"
export { useStorageStatus, type UseStorageStatusResult } from "./hooks/useStorageStatus"

export {
  useStorageTranslations,
  getStorageMessages,
} from "./locales/useStorageTranslations"

export { FolderBrowser } from "./components/FolderBrowser"
export { FolderDialog } from "./components/FolderDialog"
export { TextFileDialog } from "./components/TextFileDialog"
export { UploadImageDialog } from "./components/UploadImageDialog"
export { StorageQuotaCard } from "./components/StorageQuotaCard"
export { StorageConfirmDialog } from "./components/StorageConfirmDialog"
