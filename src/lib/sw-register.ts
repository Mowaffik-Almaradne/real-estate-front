export const SW_PATH = "/sw.js"

export function isServiceWorkerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production"
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) return null
  if (!isProductionEnv()) return null
  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: "/",
    })
    return registration
  } catch {
    return null
  }
}