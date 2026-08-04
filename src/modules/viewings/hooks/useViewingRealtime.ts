"use client"

import { useEffect } from "react"
import { getEcho } from "@/lib/echo"
import { getCurrentUserId } from "@/lib/auth"
import { USER_EVENTS } from "@/types/websocket-events"
import { viewingService } from "../services/viewingService"
import type { PropertyViewingDto } from "@/types/dto"

interface UseViewingRealtimeOptions {
  onViewingUpdated?: (viewing: PropertyViewingDto) => void
  onViewingCreated?: (viewing: PropertyViewingDto) => void
  onViewingDeleted?: (id: number) => void
}

export function useViewingRealtime(options: UseViewingRealtimeOptions = {}): void {
  const { onViewingUpdated, onViewingCreated, onViewingDeleted } = options

  useEffect(() => {
    const userId = getCurrentUserId()
    const echo = getEcho()
    if (!userId || !echo) return

    const channel = echo.private(`user.${userId}`)

    const handleUpdated = (payload: { viewing: PropertyViewingDto }) => {
      onViewingUpdated?.(payload.viewing)
    }

    const handleCreated = (payload: { viewing: PropertyViewingDto }) => {
      onViewingCreated?.(payload.viewing)
    }

    const handleDeleted = (payload: { id: number }) => {
      onViewingDeleted?.(payload.id)
    }

    channel
      .listen(USER_EVENTS.VIEWING_UPDATED, handleUpdated)
      .listen("ViewingCreated", handleCreated)
      .listen("ViewingDeleted", handleDeleted)

    return () => {
      echo.leave(`user.${userId}`)
    }
  }, [onViewingUpdated, onViewingCreated, onViewingDeleted])
}

export async function fetchViewingDetail(id: number): Promise<PropertyViewingDto> {
  return viewingService.getById(id)
}
