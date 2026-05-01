import axios from "axios"
import type { MessageDto, PaginatedMessages } from "src/types/chat"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const chatService = {
  async getMessages(roomId: number, page: number = 1, perPage: number = 20): Promise<PaginatedMessages> {
    const token = localStorage.getItem("token")
    const response = await axios.get<PaginatedMessages>(
      `${API_URL}/chat/rooms/${roomId}/messages?page=${page}&per_page=${perPage}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    return response.data
  },

  async sendMessage(roomId: number, body: string): Promise<MessageDto> {
    const token = localStorage.getItem("token")
    const response = await axios.post<MessageDto>(
      `${API_URL}/chat/rooms/${roomId}/messages`,
      { body },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    return response.data
  },
}