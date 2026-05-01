import { ref, onMounted, computed } from "vue";
import { chatService, ChatServiceError } from "@/services/chat-service";
import {
  ChatRoomDto,
  LastMessageDto,
  MessageDto,
  SendMessageRequest,
} from "@/types/chat";

export function useChat() {
  const rooms = ref<ChatRoomDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedRooms = computed(() => {
    return [...rooms.value].sort((a, b) => {
      const dateA = a.last_message?.created_at || a.created_at;
      const dateB = b.last_message?.created_at || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  });

  const fetchRooms = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      rooms.value = await chatService.getRooms();
    } catch (e) {
      if (e instanceof ChatServiceError) {
        error.value = e.message;
      } else {
        error.value = "Failed to fetch chat rooms";
      }
    } finally {
      loading.value = false;
    }
  };

  const addMessage = async (
    roomId: number,
    message: SendMessageRequest
  ): Promise<MessageDto | null> => {
    try {
      const sentMessage = await chatService.sendMessage(roomId, message);

      const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
      if (roomIndex !== -1) {
        const updatedRoom = { ...rooms.value[roomIndex] };
        updatedRoom.last_message = {
          body: sentMessage.body,
          type: sentMessage.type,
          sender_id: sentMessage.sender.id,
          created_at: sentMessage.created_at,
        };
        updatedRoom.unread_count += 1;

        const newRooms = [...rooms.value];
        newRooms.splice(roomIndex, 1);
        newRooms.unshift(updatedRoom);
        rooms.value = newRooms;
      }

      return sentMessage;
    } catch (e) {
      if (e instanceof ChatServiceError) {
        error.value = e.message;
      } else {
        error.value = "Failed to send message";
      }
      return null;
    }
  };

  const updateUnreadCount = (roomId: number, count: number): void => {
    const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
    if (roomIndex !== -1) {
      const newRooms = [...rooms.value];
      newRooms[roomIndex] = { ...newRooms[roomIndex], unread_count: count };
      rooms.value = newRooms;
    }
  };

  const markRoomAsRead = (roomId: number): void => {
    const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
    if (roomIndex !== -1) {
      const newRooms = [...rooms.value];
      newRooms[roomIndex] = { ...newRooms[roomIndex], unread_count: 0 };
      rooms.value = newRooms;
    }
  };

  const moveRoomToTop = (roomId: number, lastMessage: LastMessageDto): void => {
    const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
    if (roomIndex !== -1) {
      const newRooms = [...rooms.value];
      const [room] = newRooms.splice(roomIndex, 1);
      newRooms.unshift({ ...room, last_message: lastMessage });
      rooms.value = newRooms;
    }
  };

  onMounted(() => {
    fetchRooms();
  });

  return {
    rooms: sortedRooms,
    loading,
    error,
    addMessage: (roomId: number, message: SendMessageRequest) =>
      addMessage(roomId, message),
    updateUnreadCount: (roomId: number, count: number) =>
      updateUnreadCount(roomId, count),
    markRoomAsRead: (roomId: number) => markRoomAsRead(roomId),
    moveRoomToTop: (roomId: number, lastMessage: LastMessageDto) =>
      moveRoomToTop(roomId, lastMessage),
    fetchRooms: () => fetchRooms(),
  };
}