export type ChatRoomType = "private" | "group";

export type MessageType = "text" | "image" | "file";

export interface ParticipantDto {
  readonly id: number;
  readonly name: string;
  readonly avatar_url?: string;
}

export interface MessageAttachment {
  readonly url: string;
  readonly name: string;
  readonly type: string;
}

export interface Sender {
  readonly id: number;
  readonly name: string;
  readonly avatar_url?: string;
}

export interface PusherMessageEvent {
  readonly message_id: number;
  readonly room_id: number;
  readonly sender: Sender;
  readonly body: string;
  readonly type: MessageType;
  readonly attachment?: MessageAttachment;
  readonly created_at: string;
}

export interface LastMessageDto {
  readonly id: number;
  readonly body: string;
  readonly type: MessageType;
  readonly created_at: string;
}

export interface PropertyDto {
  readonly id: number;
  readonly title: string;
}

export interface ChatRoomDto {
  readonly id: number;
  readonly type: ChatRoomType;
  readonly name?: string | null;
  readonly property_id?: number;
  readonly property?: PropertyDto;
  readonly participants: readonly ParticipantDto[];
  readonly last_message?: LastMessageDto;
  readonly unread_count: number;
  readonly created_at: string;
  readonly updated_at?: string;
}

export interface MessageDto {
  readonly id: number;
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