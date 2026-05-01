import { useState, useEffect, useCallback } from "react"
import {
  getMessagingInstance,
  getVapidKey,
  getToken as firebaseGetToken,
} from "@/lib/firebase"
import { fcmService, FcmServiceError } from "@/services/fcm-service"

interface UseFcmResult {
  permissionStatus: NotificationPermission | "unsupported"
  isRegistered: boolean
  error: string | null
}

export function useFcm(): UseFcmResult {
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >("unsupported")
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeFcm = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") {
      return
    }

    if (!("Notification" in window)) {
      setPermissionStatus("unsupported")
      return
    }

    const currentPermission = Notification.permission
    setPermissionStatus(currentPermission)

    if (currentPermission === "granted") {
      const storedToken = fcmService.getStoredToken()
      if (storedToken) {
        setIsRegistered(true)
        return
      }
    }

    if (currentPermission === "denied") {
      setError("Notification permission denied")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== "granted") {
        setError("Notification permission not granted")
        return
      }

      const messaging = getMessagingInstance()
      const vapidKey = getVapidKey()

      if (!messaging || !vapidKey) {
        setError("Firebase messaging not configured")
        return
      }

      const token = await firebaseGetToken(messaging, {
        vapidKey,
      })

      await fcmService.registerFcmToken(token, "web")
      setIsRegistered(true)
      setError(null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register FCM token"
      setError(errorMessage)
    }
  }, [])

  useEffect(() => {
    initializeFcm()
  }, [initializeFcm])

  useEffect(() => {
    return () => {
      const cleanup = async (): Promise<void> => {
        const storedToken = fcmService.getStoredToken()
        if (storedToken) {
          try {
            await fcmService.revokeFcmToken(storedToken)
          } catch {
            // Silently fail on cleanup
          }
        }
      }
      cleanup()
    }
  }, [])

  return {
    permissionStatus,
    isRegistered,
    error,
  }
}