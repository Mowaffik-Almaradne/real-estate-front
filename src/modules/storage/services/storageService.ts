import {
  apiClient,
  ApiClientError,
  getApiData,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  CreateFolderRequest,
  CreateTextFileRequest,
  File,
  Folder,
  FolderContents,
  FolderListFilters,
  MoveFileRequest,
  MoveFolderRequest,
  RenameFileRequest,
  RenameFolderResponse,
  StoragePackage,
  StorageStatus,
  UpdateFolderRequest,
  UpdateTextFileRequest,
  UpgradeStorageRequest,
} from "../types"

export { ApiClientError as StorageServiceError }

function buildFolderParams(
  filters: FolderListFilters = {}
): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.parent_id != null) params.parent_id = String(filters.parent_id)
  else params.parent_id = ""
  return params
}

export const folderService = {
  async list(filters: FolderListFilters = {}): Promise<Folder[]> {
    const response = await apiClient.get<ApiResponse<Folder[]>>("/folders", {
      params: buildFolderParams(filters),
      silent: true,
    })
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  async contents(id: number): Promise<FolderContents> {
    const response = await apiClient.get<ApiResponse<FolderContents>>(
      `/folders/${id}`,
      { silent: true }
    )
    return getApiData(response)
  },

  async create(payload: CreateFolderRequest): Promise<Folder> {
    const response = await apiClient.post<ApiResponse<Folder>>(
      "/folders",
      payload
    )
    return getApiData(response)
  },

  async rename(id: number, payload: UpdateFolderRequest): Promise<RenameFolderResponse> {
    const response = await apiClient.post<ApiResponse<RenameFolderResponse>>(
      `/folders/${id}/rename`,
      payload
    )
    return getApiData(response)
  },

  async renameViaPut(id: number, payload: UpdateFolderRequest): Promise<Folder> {
    const response = await apiClient.put<ApiResponse<Folder>>(
      `/folders/${id}`,
      payload
    )
    return getApiData(response)
  },

  async move(id: number, payload: MoveFolderRequest): Promise<Folder> {
    const response = await apiClient.post<ApiResponse<Folder>>(
      `/folders/${id}/move`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/folders/${id}`)
  },
}

export const fileService = {
  async createText(payload: CreateTextFileRequest): Promise<File> {
    const response = await apiClient.post<ApiResponse<File>>(
      "/files/text",
      payload
    )
    return getApiData(response)
  },

  async uploadImage(
    file: globalThis.File,
    folderId?: number | null
  ): Promise<File> {
    const form = new FormData()
    form.append("file", file)
    if (folderId != null) form.append("folder_id", String(folderId))
    const response = await apiClient.post<ApiResponse<File>>(
      "/files/image",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return getApiData(response)
  },

  async updateText(id: number, payload: UpdateTextFileRequest): Promise<File> {
    const response = await apiClient.put<ApiResponse<File>>(
      `/files/${id}/text`,
      payload
    )
    return getApiData(response)
  },

  async rename(id: number, payload: RenameFileRequest): Promise<File> {
    const response = await apiClient.post<ApiResponse<File>>(
      `/files/${id}/rename`,
      payload
    )
    return getApiData(response)
  },

  async move(id: number, payload: MoveFileRequest): Promise<File> {
    const response = await apiClient.post<ApiResponse<File>>(
      `/files/${id}/move`,
      payload
    )
    return getApiData(response)
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/files/${id}`)
  },
}

export const storageService = {
  async status(): Promise<StorageStatus> {
    const response = await apiClient.get<ApiResponse<StorageStatus>>(
      "/storage/status",
      { silent: true }
    )
    return getApiData(response)
  },

  async packages(): Promise<StoragePackage[]> {
    const response = await apiClient.get<ApiResponse<StoragePackage[]>>(
      "/storage/packages",
      { silent: true }
    )
    const data = getApiData(response)
    return Array.isArray(data) ? data : []
  },

  async upgrade(payload: UpgradeStorageRequest): Promise<StorageStatus> {
    const response = await apiClient.post<ApiResponse<StorageStatus>>(
      "/storage/upgrade",
      payload
    )
    return getApiData(response)
  },
}
