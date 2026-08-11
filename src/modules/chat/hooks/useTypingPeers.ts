"use client"

import { useEffect, useState } from "react"

export interface TypingPeer {
  user_id: number
  user_name: string
  expires_at: number
}

export function useTypingPeers(
  roomId: number | null,
  channel: ReturnType<typeof Object> | null,
  currentUserId: number | null
): TypingPeer[] {
  const [peers, setPeers] = useState<TypingPeer[]>([])

  useEffect(() => {
    if (!roomId || !channel) return
    const handler = (event: { room_id?: number; user_id?: number; user_name?: string }) => {
      if (event.room_id !== roomId || event.user_id === currentUserId) return
      if (typeof event.user_id !== "number" || typeof event.user_name !== "string") return
      const userId = event.user_id
      const userName = event.user_name
      const expiresAt = Date.now() + 5000
      setPeers((prev) => {
        const filtered = prev.filter(
          (p) => p.expires_at > Date.now() && p.user_id !== userId
        )
        return [
          ...filtered,
          {
            user_id: userId,
            user_name: userName,
            expires_at: expiresAt,
          },
        ]
      })
    }
    channel.bind("chat.typing", handler)
    return () => {
      channel.unbind("chat.typing", handler)
    }
  }, [roomId, channel, currentUserId])

  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((prev) => prev.filter((p) => p.expires_at > Date.now()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return peers
}