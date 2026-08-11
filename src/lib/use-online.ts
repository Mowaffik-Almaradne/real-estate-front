"use client"

import { useEffect, useState } from "react"

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true
    return navigator.onLine
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function useInstallPrompt(): {
  canInstall: boolean
  promptInstall: () => Promise<boolean>
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return choice.outcome === "accepted"
    } catch {
      return false
    }
  }

  return {
    canInstall: deferredPrompt !== null,
    promptInstall,
  }
}