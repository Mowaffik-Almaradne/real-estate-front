## Step 1
Create `src/lib/echo.ts` — a singleton Laravel Echo client for the real-estate app.

Setup:
- Use `laravel-echo` and `pusher-js` packages
- Broadcaster: `pusher` (compatible with Laravel Reverb/Soketi/Pusher)
- Read config from env vars: `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_HOST`, `NEXT_PUBLIC_REVERB_PORT`, `NEXT_PUBLIC_REVERB_SCHEME`
- Auth endpoint: `/api/broadcasting/auth` with Bearer token header
- Export a `getEcho(): Echo` function — lazy init, singleton pattern
- Export `destroyEcho(): void` — cleanup on logout
- Handle SSR: return null-safe on server (typeof window === 'undefined')

TypeScript: type Echo instance properly. No `any`.
Install command to include in note: `npm install laravel-echo pusher-js`

## Step 2
Create `src/types/websocket-events.ts` — typed payloads for all real-time events.

Events to type:

Chat channel `chat.{roomId}`:
- `MessageSent`: message: MessageDto
- `MessageDeleted`: message_id: number, room_id: number
- `UserTyping`: user: ParticipantDto, room_id: number

User channel `user.{userId}`:
- `NewNotification`: notification: NotificationDto
- `UnreadCountUpdated`: count: number

Property channel `property.{propertyId}` (future-safe):
- `PropertyUpdated`: property_id: number, changes: Record

Create a generic `ChannelEvent` wrapper type.
Export a `CHAT_EVENTS` and `USER_EVENTS` const object with event name strings (avoid magic strings in hooks).

No `any`. All fields `readonly`.

## Step 3
Create `src/hooks/use-chat-channel.ts`.

Props:
- `roomId: number | null`
- `onMessageReceived: (msg: MessageDto) => void`
- `onMessageDeleted: (messageId: number) => void`
- `onUserTyping: (user: ParticipantDto) => void`

Behavior:
- On mount (when roomId is not null): join private channel `chat.{roomId}` via `getEcho()`
- Listen to `CHAT_EVENTS.MESSAGE_SENT` → call `onMessageReceived`
- Listen to `CHAT_EVENTS.MESSAGE_DELETED` → call `onMessageDeleted`
- Listen to `CHAT_EVENTS.USER_TYPING` → call `onUserTyping`
- On unmount or roomId change: leave the channel (`echo.leave(...)`)
- Handle null echo gracefully (SSR / before login)

Use `useEffect` with proper cleanup. `useCallback` for all handlers passed as deps.
Import from `@/lib/echo`, `@/types/chat`, `@/types/websocket-events`.

## Step 4
Create `src/hooks/use-user-channel.ts`.

Props:
- `userId: number | null`
- `onNewNotification: (notification: NotificationDto) => void`
- `onUnreadCountUpdated: (count: number) => void`
- `onNewChatMessage?: (roomId: number, message: MessageDto) => void` — optional, for updating room list without being in the room

Behavior:
- Join private channel `user.{userId}` via `getEcho()`
- Listen to `USER_EVENTS.NEW_NOTIFICATION` → call `onNewNotification`
- Listen to `USER_EVENTS.UNREAD_COUNT_UPDATED` → call `onUnreadCountUpdated`
- If `onNewChatMessage` provided: also listen to `MessageSent` events (the backend may broadcast to the user channel) → parse and call
- Leave channel on unmount

This hook is typically mounted once at the root layout level and kept alive for the session.

Import from `@/lib/echo`, `@/types/notification`, `@/types/websocket-events`.

## Step 5
Update `src/components/features/chat/chat-window.tsx` to wire real-time events.

Changes:
1. Accept additional prop: `currentUserId: number`
2. Use `useMessages(roomId)` as before
3. Add `useChatChannel({ roomId, onMessageReceived: appendMessage, onMessageDeleted: deleteMessage, onUserTyping: setTyping })`
4. The `sendMessage` action should also call `chatService.sendTypingIndicator()` — but the MessageInput `onTyping` callback handles this; just pass it down
5. When current user sends a message: do NOT append from WebSocket (check sender.id !== currentUserId before calling appendMessage, or deduplicate by ID)

Also update the `useChatRooms` composition: when a new message arrives via WebSocket on ANY room, call `moveRoomToTop(roomId, lastMessage)`.

Explain how to wire the global `useUserChannel` in the dashboard layout to call `useChatRooms().moveRoomToTop` and `useNotifications().appendNotification`.

## Step 6
Create `src/lib/api-client.ts` — a shared fetch wrapper for all services.

Features:
- `apiClient(path: string, options?: RequestInit): Promise` — prepends base URL (`NEXT_PUBLIC_API_URL`), injects `Authorization: Bearer ` and `Content-Type: application/json` headers
- `getAuthToken(): string | null` — reads from localStorage or a cookie (match the auth strategy used in the project)
- Helper: `apiGet(path: string): Promise` — calls apiClient, parses `.data` from JSON response
- Helper: `apiPost(path: string, body: unknown): Promise`
- Helper: `apiPatch(path: string, body?: unknown): Promise`
- Helper: `apiDelete(path: string, body?: unknown): Promise`
- All helpers throw `ApiError` with `{ status: number, message: string, errors?: Record }` on non-2xx

TypeScript strict. No `any`. Used by all services in the project.

## Step 7
Create `src/services/fcm-service.ts` and `src/hooks/use-fcm.ts`.

fcm-service.ts:
- `registerFcmToken(token: string, deviceType: "web", deviceName?: string): Promise` → POST /api/v1/fcm/register
- `revokeFcmToken(token: string): Promise` → DELETE /api/v1/fcm/revoke
- Types: `FcmRegisterRequest` with token, device_type, device_name (optional), app_version (optional)

use-fcm.ts:
- On mount: check if browser supports Notification API and FCM
- Request notification permission if not granted
- If granted: get FCM token from Firebase SDK (`getToken(messaging, { vapidKey })`)
- Call `registerFcmToken(token, "web")`
- Store token in localStorage to avoid re-registering
- On unmount / logout: call `revokeFcmToken` and clear localStorage
- Expose: `permissionStatus: NotificationPermission`, `isRegistered: boolean`, `error: string | null`

Add note: requires Firebase config in `src/lib/firebase.ts` with `NEXT_PUBLIC_FIREBASE_*` env vars.

## Step 8
Create `src/components/providers/realtime-provider.tsx` — a context provider that boots all real-time subscriptions.

This component wraps the authenticated dashboard layout.

Responsibilities:
1. Get `currentUserId` from auth session/context
2. Call `useNotifications()` — expose via context
3. Call `useChatRooms()` — expose via context
4. Call `useUserChannel({ userId: currentUserId, onNewNotification: notifications.appendNotification, onUnreadCountUpdated: notifications.updateCount, onNewChatMessage: chatRooms.moveRoomToTop })`
5. Call `useFcm()` — register push token silently
6. Export `useRealtimeContext()` hook for consumers

Also create `src/app/(dashboard)/layout.tsx`:
- Wrap children with ``
- Render `` in navbar (uses context)
- Render `` in sidebar (uses context)

This ensures WebSocket connections are established once and shared across all dashboard pages.

## Step 9
Create `src/lib/validations/chat-schemas.ts` and `src/lib/validations/notification-schemas.ts` using Zod.

chat-schemas.ts:
- `sendMessageSchema`: body (min 1 char, max 5000), type (enum), attachment_url (url, optional)
- `createRoomSchema`: name (optional, max 100), type (enum), participant_ids (array of numbers, min 1)
- Export inferred types: `SendMessageInput`, `CreateRoomInput`

notification-schemas.ts:
- `notificationDtoSchema`: validates API response shape
- `notificationsResponseSchema`: wraps data array + meta

Use in services to validate API responses at the boundary.
Strict mode: `z.object(...).strict()` where appropriate. Export all schemas and inferred types.