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

const resolvedApiUrl = stripTrailingSlash(
  readEnv("NEXT_PUBLIC_API_URL", DEFAULT_API_URL) ?? DEFAULT_API_URL
)
const resolvedApiOrigin = stripTrailingSlash(resolvedApiUrl.replace(/\/api\/?$/, ""))

export const env = {
  apiUrl: resolvedApiUrl,
  pusher: {
    key: readEnvRequired("NEXT_PUBLIC_PUSHER_APP_KEY"),
    cluster: readEnv("NEXT_PUBLIC_PUSHER_APP_CLUSTER", DEFAULT_PUSHER_CLUSTER) ?? DEFAULT_PUSHER_CLUSTER,
    // Laravel serves broadcasting auth at `/broadcasting/auth` (not under `/api`).
    authUrl: readEnv(
      "NEXT_PUBLIC_PUSHER_AUTH_URL",
      `${resolvedApiOrigin}${DEFAULT_PUSHER_AUTH_PATH}`
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
  return `${getApiOrigin()}${DEFAULT_PUSHER_AUTH_PATH}`
}

export function getApiBaseUrl(path = ""): string {
  if (!path) return ensureTrailingSlash(env.apiUrl)
  if (path.startsWith("/")) return `${env.apiUrl}${path}`
  return `${env.apiUrl}/${path}`
}

/** Origin without trailing `/api` — used for Sanctum routes like `/user`. */
export function getApiOrigin(): string {
  return stripTrailingSlash(env.apiUrl.replace(/\/api\/?$/, ""))
}

/**
 * Build a URL for Sanctum/root routes (e.g. `/user`).
 * In the browser, go through the Next `/api/sanctum-proxy` route to avoid CORS
 * (Laravel only applies CORS to `/api/*` on the backend).
 */
export function getOriginUrl(path = ""): string {
  const normalized = !path ? "" : path.startsWith("/") ? path : `/${path}`
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/sanctum-proxy${normalized}`
  }
  return `${getApiOrigin()}${normalized}`
}
