const DEFAULT_API_URL = "http://localhost:8000/api"
const DEFAULT_PUSHER_CLUSTER = "mt1"
const DEFAULT_PUSHER_AUTH_PATH = "/broadcasting/auth"
const DEFAULT_CHECKOUT_RETURN_PATH = "/settings?subscription=return"
const DEFAULT_CHECKOUT_CANCEL_PATH = "/settings?subscription=cancelled"

function readEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name]
  if (value && value.trim().length > 0) return value
  return fallback
}

function readEnvRequired(name: string, fallback?: string): string {
  return readEnv(name, fallback) ?? ""
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`
}

export const env = {
  apiUrl: stripTrailingSlash(
    readEnv("NEXT_PUBLIC_API_URL", DEFAULT_API_URL) ?? DEFAULT_API_URL
  ),
  pusher: {
    key: readEnvRequired("NEXT_PUBLIC_PUSHER_APP_KEY"),
    cluster: readEnv("NEXT_PUBLIC_PUSHER_APP_CLUSTER", DEFAULT_PUSHER_CLUSTER) ?? DEFAULT_PUSHER_CLUSTER,
    authUrl: readEnv(
      "NEXT_PUBLIC_PUSHER_AUTH_URL",
      `${stripTrailingSlash(readEnv("NEXT_PUBLIC_API_URL", DEFAULT_API_URL) ?? DEFAULT_API_URL)}${DEFAULT_PUSHER_AUTH_PATH}`
    ) ?? "",
    forceTLS: (readEnv("NEXT_PUBLIC_PUSHER_FORCE_TLS", "true") ?? "true").toLowerCase() !== "false",
  },
  stripe: {
    publishableKey: readEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    checkoutReturnUrl: readEnv(
      "NEXT_PUBLIC_CHECKOUT_RETURN_URL",
      DEFAULT_CHECKOUT_RETURN_PATH
    ) ?? DEFAULT_CHECKOUT_RETURN_PATH,
    checkoutCancelUrl: readEnv(
      "NEXT_PUBLIC_CHECKOUT_CANCEL_URL",
      DEFAULT_CHECKOUT_CANCEL_PATH
    ) ?? DEFAULT_CHECKOUT_CANCEL_PATH,
  },
  fcm: {
    enabled: (readEnv("NEXT_PUBLIC_FCM_ENABLED", "false") ?? "false").toLowerCase() === "true",
    vapidKey: readEnv("NEXT_PUBLIC_FCM_VAPID_KEY"),
  },
  appUrl: stripTrailingSlash(
    readEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000") ?? "http://localhost:3000"
  ),
} as const

export function getBroadcastingAuthUrl(): string {
  if (env.pusher.authUrl) return env.pusher.authUrl
  return `${env.apiUrl}${DEFAULT_PUSHER_AUTH_PATH}`
}

export function getApiBaseUrl(path = ""): string {
  if (!path) return ensureTrailingSlash(env.apiUrl)
  if (path.startsWith("/")) return `${env.apiUrl}${path}`
  return `${env.apiUrl}/${path}`
}
