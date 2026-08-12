import type { Media } from "./common"
import type { Timestamps } from "./common"

export interface TemporaryFileDto extends Timestamps {
  id: number
  folder: string
  filename: string
  mime_type?: string
  size?: number
  url?: string
  thumb_url?: string
  expires_at?: string
}

export interface UploadMediaRequest {
  folder: string
  file: File
}

export interface UploadMediaResponse {
  file: TemporaryFileDto
  media: Media
}

export interface AttachMediaRequest {
  temporary_folder: string
  collection?: string
}
