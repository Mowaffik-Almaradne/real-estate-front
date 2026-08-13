export type ChatRoomType = "private" | "group" | "property"

export type MessageType = "text" | "image" | "file"

export interface ParticipantDto {
  readonly id: number
  readonly name: string
  readonly avatar_url?: string
}

export interface LastMessageDto {
  readonly id: number
  readonly body: string
  readonly type: MessageType
  readonly sender_id: number
  readonly created_at: string
}

export interface ChatRoomDto {
  readonly id: number
  readonly type: ChatRoomType
  readonly name?: string | null
  readonly property_id?: number
  readonly property?: PropertyDto
  readonly participants: readonly ParticipantDto[]
  readonly last_message?: LastMessageDto
  readonly unread_count: number
  readonly created_at: string
  readonly updated_at?: string
  readonly last_read_at?: string | null
}

export interface PropertyDto {
  readonly id: number
  readonly title: string
}

export interface Sender {
  readonly id: number
  readonly name: string
  readonly avatar_url?: string
}

export interface MessageAttachment {
  readonly url: string
  readonly name: string
  readonly mime_type?: string
  readonly size?: number
  readonly thumb_url?: string
  readonly width?: number
  readonly height?: number
}

export interface PusherMessageEvent {
  readonly message_id: number
  readonly room_id: number
  readonly sender: Sender
  readonly body: string
  readonly type: MessageType
  readonly attachment?: MessageAttachment
  readonly created_at: string
}

export interface ReplyReference {
  readonly id: number
  readonly sender_name: string
  readonly body: string
  readonly type: MessageType
  readonly attachment_url?: string | null
}

export interface MessageDto {
  readonly id: number
  readonly room_id: number
  readonly body: string
  readonly type: MessageType
  readonly attachment_url?: string
  readonly attachment_name?: string
  readonly attachment_mime?: string
  readonly attachment_size?: number
  readonly thumb_url?: string
  readonly width?: number
  readonly height?: number
  readonly sender: ParticipantDto
  readonly created_at: string
  readonly read_at?: string | null
  readonly reply_to?: ReplyReference | null
}

export interface CreateChatRoomRequest {
  readonly type: ChatRoomType
  readonly recipient_id?: number
  readonly property_id?: number
}

export interface SendMessageRequest {
  readonly body: string
  readonly type: MessageType
  readonly attachment_url?: string
  readonly reply_to_id?: number
}

export interface UploadAttachmentResponse {
  readonly url: string
  readonly name: string
  readonly mime_type: string
  readonly size: number
  readonly thumb_url?: string
  readonly width?: number
  readonly height?: number
}

export interface TypingEvent {
  readonly room_id: number
  readonly user_id: number
  readonly user_name: string
  readonly expires_at?: string
}

export interface ReadReceiptEvent {
  readonly room_id: number
  readonly user_id: number
  readonly message_id: number
  readonly read_at: string
}

export interface LocalAttachment {
  readonly id: string
  readonly file: File
  readonly preview?: string
  status: "pending" | "uploading" | "uploaded" | "error"
  progress: number
  uploadedUrl?: string
  uploadedName?: string
  uploadedMime?: string
  uploadedSize?: number
  thumbUrl?: string
  error?: string
}

export interface PaginatedMessages {
  readonly data: readonly MessageDto[]
  readonly meta: {
    readonly current_page: number
    readonly total: number
    readonly per_page: number
    readonly last_page?: number
  }
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const

export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
] as const

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024

export function isImageMime(mime?: string): boolean {
  return Boolean(mime && ACCEPTED_IMAGE_TYPES.includes(mime as never))
}

export function isAcceptedMime(mime?: string): boolean {
  return Boolean(mime && ACCEPTED_FILE_TYPES.includes(mime as never))
}