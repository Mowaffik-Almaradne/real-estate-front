"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "src/lib/sw-register"

export function ServiceWorkerProvider() {
  useEffect(() => {
    void Promise.resolve().then(() => {
      void registerServiceWorker()
    })
  }, [])
  return null
}
