import { ref, watch, computed } from "vue";
import { chatService, ChatServiceError } from "@/services/chat-service";
import {
  MessageDto,
  PaginatedMessages,
  ParticipantDto,
  SendMessageRequest,
} from "@/types/chat";

interface TempMessage extends MessageDto {
  tempId: number;
}

export function useMessages(roomId: number) {
  const messages = ref<(MessageDto | TempMessage)[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const typingUsers = ref<ParticipantDto[]>([]);
  const currentPage = ref(1);
  const total = ref(0);
  const perPage = ref(20);
  const hasMore = computed(() => messages.value.length < total.value);

  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  let tempIdCounter = -1;

  const fetchMessages = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const result: PaginatedMessages = await chatService.getMessages(
        roomId,
        currentPage.value,
        perPage.value
      );
      messages.value = result.data;
      total.value = result.meta.total;
      perPage.value = result.meta.per_page;
    } catch (e) {
      if (e instanceof ChatServiceError) {
        error.value = e.message;
      } else {
        error.value = "Failed to fetch messages";
      }
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async (): Promise<void> => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    error.value = null;
    try {
      const nextPage = currentPage.value + 1;
      const result: PaginatedMessages = await chatService.getMessages(
        roomId,
        nextPage,
        perPage.value
      );
      messages.value = [...result.data, ...messages.value];
      currentPage.value = nextPage;
      total.value = result.meta.total;
    } catch (e) {
      if (e instanceof ChatServiceError) {
        error.value = e.message;
      } else {
        error.value = "Failed to load more messages";
      }
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (
    body: string,
    type: "text" | "image" | "file",
    attachmentUrl?: string
  ): Promise<MessageDto | null> => {
    const tempId = tempIdCounter--;
    const tempMessage: TempMessage = {
      id: -1,
      tempId,
      room_id: roomId,
      body,
      type,
      attachment_url: attachmentUrl,
      sender: { id: 0, name: "You" },
      created_at: new Date().toISOString(),
    };

    messages.value = [tempMessage, ...messages.value];

    try {
      const request: SendMessageRequest = {
        body,
        type,
        ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
      };
      const sentMessage = await chatService.sendMessage(roomId, request);

      const tempIndex = messages.value.findIndex(
        (m) => "tempId" in m && m.tempId === tempId
      );
      if (tempIndex !== -1) {
        messages.value.splice(tempIndex, 1, sentMessage);
      }

      return sentMessage;
    } catch (e) {
      const tempIndex = messages.value.findIndex(
        (m) => "tempId" in m && m.tempId === tempId
      );
      if (tempIndex !== -1) {
        messages.value.splice(tempIndex, 1);
      }

      if (e instanceof ChatServiceError) {
        error.value = e.message;
      } else {
        error.value = "Failed to send message";
      }
      return null;
    }
  };

  const deleteMessage = (messageId: string): void => {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      const originalMessage = messages.value[index];
      messages.value.splice(index, 1);

      chatService
        .deleteMessage(roomId, messageId)
        .catch(() => {
          messages.value.splice(index, 0, originalMessage);
        });
    }
  };

  const appendMessage = (msg: MessageDto): void => {
    const exists = messages.value.some((m) => m.id === msg.id);
    if (!exists) {
      messages.value = [msg, ...messages.value];
    }
  };

  const setTyping = (user: ParticipantDto): void => {
    const exists = typingUsers.value.some((u) => u.id === user.id);
    if (!exists) {
      typingUsers.value = [...typingUsers.value, user];
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    typingTimeout = setTimeout(() => {
      typingUsers.value = typingUsers.value.filter((u) => u.id !== user.id);
    }, 3000);
  };

  watch(
    () => roomId,
    (newRoomId) => {
      if (newRoomId) {
        currentPage.value = 1;
        messages.value = [];
        fetchMessages();
      }
    },
    { immediate: true }
  );

  return {
    messages,
    loading,
    error,
    typingUsers,
    hasMore,
    sendMessage,
    deleteMessage,
    loadMore,
    appendMessage,
    setTyping,
  };
}