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

export const chatService = {
  async getRooms(): Promise<ChatRoomDto[]> {
    const response = await apiClient.get<ApiResponse<ChatRoomDto[]>>("/chat/rooms")
    return getApiData(response)
  },

  async createRoom(request: CreateChatRoomRequest): Promise<ChatRoomDto> {
    const response = await apiClient.post<ApiResponse<ChatRoomDto>>("/chat/rooms", request)
    return getApiData(response)
  },

  async getMessages(
    roomId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedMessages> {
    const response = await apiClient.get<ApiResponse<MessageDto[]>>(
      `/chat/rooms/${roomId}/messages`,
      { params: { page, per_page: perPage } }
    )
    const pagination = getApiPagination(response)
    return {
      data: getApiData(response),
      meta: {
        current_page: pagination?.current_page ?? page,
        total: pagination?.total ?? 0,
        per_page: pagination?.per_page ?? perPage,
      },
    }
  },

  async sendMessage(roomId: number, request: SendMessageRequest): Promise<MessageDto> {
    const response = await apiClient.post<ApiResponse<MessageDto>>(
      `/chat/rooms/${roomId}/messages`,
      request
    )
    return getApiData(response)
  },

  async sendTyping(roomId: number): Promise<void> {
    await apiClient.post(`/chat/rooms/${roomId}/typing`)
  },

  async deleteMessage(roomId: number, messageId: number): Promise<void> {
    await apiClient.delete(`/chat/rooms/${roomId}/messages/${messageId}`)
  },

  async markRoomAsRead(roomId: number): Promise<void> {
    await apiClient.post(`/chat/rooms/${roomId}/read`)
  },

  async uploadAttachment(roomId: number, file: File): Promise<UploadAttachmentResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post<ApiResponse<UploadAttachmentResponse>>(
      `/chat/rooms/${roomId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return getApiData(response)
  },
}
