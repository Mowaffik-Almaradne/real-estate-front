import {
  ChatRoomDto,
  CreateChatRoomRequest,
  MessageDto,
  PaginatedMessages,
  SendMessageRequest,
} from "@/types/chat";

export class ChatServiceError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ChatServiceError";
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.message || `HTTP error ${response.status}`;
    throw new ChatServiceError(response.status, message);
  }
  const json = await response.json();
  return json.data as T;
}

export const chatService = {
  async getRooms(): Promise<ChatRoomDto[]> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<ChatRoomDto[]>(response);
  },

  async createRoom(request: CreateChatRoomRequest): Promise<ChatRoomDto> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<ChatRoomDto>(response);
  },

  async getMessages(
    roomId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedMessages> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    const response = await fetch(
      `${API_BASE_URL}/chat/rooms/${roomId}/messages?${params}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    return handleResponse<PaginatedMessages>(response);
  },

  async sendMessage(
    roomId: number,
    request: SendMessageRequest
  ): Promise<MessageDto> {
    const response = await fetch(
      `${API_BASE_URL}/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(request),
      }
    );
    return handleResponse<MessageDto>(response);
  },

  async sendTyping(roomId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/chat/rooms/${roomId}/typing`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.message || `HTTP error ${response.status}`;
      throw new ChatServiceError(response.status, message);
    }
  },

  async deleteMessage(roomId: number, messageId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/chat/rooms/${roomId}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.message || `HTTP error ${response.status}`;
      throw new ChatServiceError(response.status, message);
    }
  },
};