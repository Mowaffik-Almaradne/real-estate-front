import { apiClient, getApiData, type ApiResponse } from "@/lib/apiClient"
import type { TemporaryFileDto } from "@/types/dto"

export interface UploadTemporaryFileOptions {
  type: "property" | "avatar"
  file: File
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export interface UploadTemporaryFilesOptions {
  type: "property"
  files: File[]
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export const mediaService = {
  async uploadOne(options: UploadTemporaryFileOptions): Promise<TemporaryFileDto> {
    const form = new FormData()
    form.append("type", options.type)
    form.append("file", options.file)
    const response = await apiClient.post<ApiResponse<TemporaryFileDto>>("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      signal: options.signal,
      onUploadProgress: options.onProgress
        ? (event) => {
            if (!event.total) return
            const percent = Math.round((event.loaded * 100) / event.total)
            options.onProgress?.(percent)
          }
        : undefined,
    })
    return getApiData(response)
  },

  async uploadMany(options: UploadTemporaryFilesOptions): Promise<TemporaryFileDto[]> {
    const form = new FormData()
    form.append("type", options.type)
    for (const file of options.files) {
      form.append("files[]", file)
    }
    const response = await apiClient.post<ApiResponse<TemporaryFileDto[]>>("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      signal: options.signal,
      onUploadProgress: options.onProgress
        ? (event) => {
            if (!event.total) return
            const percent = Math.round((event.loaded * 100) / event.total)
            options.onProgress?.(percent)
          }
        : undefined,
    })
    return getApiData(response)
  },
}
