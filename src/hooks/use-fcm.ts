"use client"

import { useState } from "react"

interface UseFcmResult {
  permissionStatus: NotificationPermission | "unsupported"
  isRegistered: boolean
  error: string | null
}

export function useFcm(): UseFcmResult {
  const [permissionStatus] = useState<NotificationPermission | "unsupported">("unsupported")
  const [isRegistered] = useState(false)
  const [error] = useState<string | null>(null)

  return {
    permissionStatus,
    isRegistered,
    error,
  }
}