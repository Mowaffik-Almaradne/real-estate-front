import { apiClient, getApiData, getApiPagination, ApiClientError, type ApiResponse } from "@/lib/apiClient"
import type {
  ChatRoomDto,
  CreateChatRoomRequest,
  MessageDto,
  PaginatedMessages,
  SendMessageRequest,
  UploadAttachmentResponse,
} from "@/types/chat"

export { ApiClientError as ChatServiceError }

type RawRoom = Partial<ChatRoomDto> & {
  id: number
  participants?: ChatRoomDto["participants"] | null
}

function normalizeRoom(room: RawRoom): ChatRoomDto {
  return {
    id: room.id,
    type: (room.type as ChatRoomDto["type"]) ?? "private",
    name: room.name ?? null,
    property_id: room.property_id,
    property: room.property,
    participants: Array.isArray(room.participants) ? room.participants : [],
    last_message: room.last_message,
    unread_count: typeof room.unread_count === "number" ? room.unread_count : 0,
    created_at: room.created_at ?? "",
    updated_at: room.updated_at,
    last_read_at: room.last_read_at,
  }
}

export const chatService = {
  async getRooms(): Promise<ChatRoomDto[]> {
    const response = await apiClient.get<ApiResponse<RawRoom[]>>("/chat/rooms")
    const rooms = getApiData(response) ?? []
    return rooms.map(normalizeRoom)
  },

  async getRoom(roomId: number): Promise<ChatRoomDto> {
    const response = await apiClient.get<ApiResponse<RawRoom>>(`/chat/rooms/${roomId}`)
    return normalizeRoom(getApiData(response))
  },

  async createRoom(request: CreateChatRoomRequest): Promise<ChatRoomDto> {
    const response = await apiClient.post<ApiResponse<RawRoom>>("/chat/rooms", request)
    return normalizeRoom(getApiData(response))
  },

  async getMessages(
    roomId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedMessages> {
    const response = await apiClient.get<ApiResponse<MessageDto[]>>(
      `/chat/rooms/${roomId}/messages`,
      { params: { page, perPage } }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response) ?? [],
      meta: {
        current_page: pagination?.current_page ?? page,
        total: pagination?.total ?? 0,
        per_page: pagination?.per_page ?? perPage,
        last_page: pagination?.last_page,
      },
    }
  },

  /**
   * Load the newest page of messages (API paginates oldest-first).
   */
  async getLatestMessages(
    roomId: number,
    perPage: number = 20
  ): Promise<PaginatedMessages & { page: number }> {
    const first = await this.getMessages(roomId, 1, perPage)
    const per = Math.max(1, first.meta.per_page || perPage)
    const lastPage = Math.max(
      1,
      first.meta.last_page ?? (Math.ceil((first.meta.total || 0) / per) || 1)
    )

    if (lastPage <= 1) {
      return { ...first, page: 1 }
    }

    const latest = await this.getMessages(roomId, lastPage, perPage)
    return { ...latest, page: lastPage }
  },

  async sendMessage(roomId: number, request: SendMessageRequest): Promise<MessageDto> {
    const payload: Record<string, unknown> = {
      body: request.body,
      type: request.type,
    }
    if (request.attachment_url) payload.attachment_url = request.attachment_url
    // OpenAPI uses parent_id for replies
    if (request.reply_to_id) payload.parent_id = request.reply_to_id

    const response = await apiClient.post<ApiResponse<MessageDto>>(
      `/chat/rooms/${roomId}/messages`,
      payload
    )
    return getApiData(response)
  },

  async sendTyping(roomId: number): Promise<void> {
    await apiClient.post(`/chat/rooms/${roomId}/typing`, undefined, { silent: true })
  },

  async deleteMessage(roomId: number, messageId: number): Promise<void> {
    await apiClient.delete(`/chat/rooms/${roomId}/messages/${messageId}`)
  },

  /**
   * Backend has no `/read` route (404). Kept as a safe no-op for callers.
   */
  async markRoomAsRead(_roomId: number): Promise<void> {
    return
  },

  async uploadAttachment(_roomId: number, _file: File): Promise<UploadAttachmentResponse> {
    throw new ApiClientError(404, "File attachments are not supported by the API yet")
  },
}
