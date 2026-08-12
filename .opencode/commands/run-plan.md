## Step 1
Using the following backend spec, create TypeScript types.

Backend payload for MessageSentEvent:
{
  "message_id": 123,
  "room_id": 1,
  "sender": { "id": 2, "name": "John Doe", "avatar_url": "https://..." },
  "body": "Hello!",
  "type": "text",
  "attachment": { "url": "...", "name": "file.pdf", "type": "application/pdf" },
  "created_at": "2026-05-03T10:30:00Z"
}

Backend ChatRoom model:
{
  "id": 1, "type": "private", "name": null, "property_id": 5,
  "property": { "id": 5, "title": "Luxury Apartment" },
  "participants": [{ "id": 2, "name": "John Doe", "avatar_url": "..." }],
  "last_message": { "id": 123, "body": "Hello!", "created_at": "..." },
  "unread_count": 3,
  "created_at": "...", "updated_at": "..."
}

Requirements:
- Strict TypeScript, no `any`
- MessageType as discriminated union: "text" | "image" | "file"
- ChatRoomType as union: "private" | "group"
- MessageAttachment as separate interface
- PusherMessageEvent interface matching the broadcast payload exactly
- All fields properly typed with readonly where data is immutable
- Export all types

## Step 2
Create the Pusher + Laravel Echo configuration file at `src/lib/echo.ts`.

Requirements:
- Use env vars: NEXT_PUBLIC_PUSHER_APP_KEY, NEXT_PUBLIC_PUSHER_APP_CLUSTER
- Auth endpoint: /api/broadcasting/auth (hits the backend, not a Next.js route)
- forceTLS: true
- Export a singleton `echo` instance (lazy-initialized, safe for SSR — only instantiate on client)
- Export a `disconnectEcho()` cleanup function
- No `any` types — import types from `laravel-echo` and `pusher-js`
- Wrap instantiation in `typeof window !== "undefined"` guard

Backend auth endpoint: POST /api/broadcasting/auth
Requires headers: Authorization Bearer token (retrieve from wherever auth token is stored in this app)

## Step 3
Create a custom hook at `src/hooks/use-chat-room.ts` that subscribes to a Pusher private channel for a chat room.

Channel format: `chat.{roomId}` (private channel)
Event name: `message.sent`
Pusher payload type: PusherMessageEvent (from `@/types/chat`)

Requirements:
- Accept `roomId: number | null` as parameter — do nothing if null
- Import `echo` singleton from `@/lib/echo`
- On mount (or when roomId changes): subscribe to `chat.{roomId}` via `echo.private(...)`
- Listen to `message.sent` event, call an `onMessage: (msg: PusherMessageEvent) => void` callback prop
- On unmount or roomId change: call `Echo.leave(`chat.${roomId}`)` to unsubscribe
- Return `{ isConnected: boolean }` — track connection state via pusher connection binding:
  - bind to `state_change` on the pusher connection object
  - states: 'connected' | 'connecting' | 'disconnected' | 'unavailable'
- No `any` types
- Handle the case where `echo` is null (SSR guard)

## Step 4
Create or update the hook at `src/hooks/use-messages.ts` to integrate real-time messages with the existing paginated message list.

This hook should:
1. Fetch paginated messages from: GET /api/chat/rooms/{roomId}/messages
2. Use `useChatRoom` hook (from `@/hooks/use-chat-room`) to receive real-time new messages
3. When a new PusherMessageEvent arrives:
   - Map it to the existing `Message` type (from `@/types/chat`)
   - Prepend it to the local messages list (avoid duplicates by checking message_id)
4. Expose:
   - `messages: Message[]`
   - `isLoading: boolean`
   - `isConnected: boolean` (from useChatRoom)
   - `sendMessage: (body: string, type?: MessageType) => Promise<void>` — POST /api/chat/rooms/{roomId}/messages
   - `loadMore: () => void` — for pagination
   - `hasMore: boolean`

API call goes through the existing service layer pattern in `@/services/`.
Use React 19 patterns (no legacy lifecycle methods).
No `any` types.

## Step 5
Create a small UI component at `src/components/features/chat/connection-status.tsx`.

Props:
- `isConnected: boolean`

Requirements:
- Show a subtle indicator: green dot + "Live" when connected, yellow dot + "Reconnecting..." when not
- Use Tailwind CSS 4 utility classes only
- Use Lucide React icons if needed (e.g., Wifi, WifiOff)
- Keep it minimal — suitable for display inside a chat header
- Animate the dot using Tailwind's `animate-pulse` when reconnecting
- No external state — purely presentational, driven by props

## Step 6
Update the chat room page at `src/app/(protected)/chat/[roomId]/page.tsx` (adjust path to match actual route).

Changes required:
1. Replace any polling/manual refresh logic with the `useMessages` hook from `@/hooks/use-messages`
2. Add `<ConnectionStatus isConnected={isConnected} />` component in the chat header area
3. Auto-scroll to bottom when a new real-time message arrives (useEffect watching messages array length)
4. Remove any setInterval or manual fetch-on-timer patterns

Do NOT:
- Change the existing UI layout or styling
- Touch unrelated components
- Add new dependencies

Only modify what is needed to wire in real-time behavior.