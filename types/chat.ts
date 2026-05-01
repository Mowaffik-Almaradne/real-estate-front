export type ChatRoomType = "direct" | "group";

export type MessageType = "text" | "image" | "file";

export interface ParticipantDto {
  readonly id: number;
  readonly name: string;
  readonly avatar_url?: string;
}

export interface LastMessageDto {
  readonly body: string;
  readonly type: MessageType;
  readonly sender_id: number;
  readonly created_at: string;
}

export interface ChatRoomDto {
  readonly id: number;
  readonly name?: string;
  readonly type: ChatRoomType;
  readonly participants: readonly ParticipantDto[];
  readonly last_message?: LastMessageDto;
  readonly unread_count: number;
  readonly created_at: string;
}

export interface MessageDto {
  readonly id: string;
  readonly room_id: number;
  readonly body: string;
  readonly type: MessageType;
  readonly attachment_url?: string;
  readonly sender: ParticipantDto;
  readonly created_at: string;
}

export interface CreateChatRoomRequest {
  readonly name?: string;
  readonly type: ChatRoomType;
  readonly participant_ids: readonly number[];
}

export interface SendMessageRequest {
  readonly body: string;
  readonly type: MessageType;
  readonly attachment_url?: string;
}

export interface PaginatedMessages {
  readonly data: readonly MessageDto[];
  readonly meta: {
    readonly current_page: number;
    readonly total: number;
    readonly per_page: number;
  };
}