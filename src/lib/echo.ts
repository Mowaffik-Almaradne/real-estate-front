import Echo from "laravel-echo"
import Pusher from "pusher-js"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo | null = null

function isServer(): boolean {
  return typeof window === "undefined"
}

function getReverbConfig(): {
  key: string
  host: string
  port: string
  scheme: string
} {
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY || ""
  const host = process.env.NEXT_PUBLIC_REVERB_HOST || ""
  const port = process.env.NEXT_PUBLIC_REVERB_PORT || ""
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "https"

  return { key, host, port, scheme }
}

export function getEcho(): Echo | null {
  if (isServer()) {
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  const { key, host, port, scheme } = getReverbConfig()

  if (!key) {
    console.warn("Reverb app key not configured. WebSocket disabled.")
    return null
  }

  const wsHost = host ? `${scheme}://${host}${port ? `:${port}` : ""}` : undefined

  echoInstance = new Echo({
    broadcaster: "pusher",
    key,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || "mt1",
    forceTLS: scheme === "https",
    ...(wsHost ? { wsHost } : {}),
    ...(port ? { wsPort: port } : {}),
    authorizer: (channel: string) => {
      return {
        authorize: (socketId: string, callback: (response: { auth: string; channel_data?: string }) => void) => {
          const token = localStorage.getItem("token")
          fetch("/api/broadcasting/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel,
            }),
          })
            .then((res) => res.json())
            .then((data) => callback(data))
            .catch((err) => callback({ auth: "", channel_data: "" }))
        },
      }
    },
  })

  return echoInstance
}

export function destroyEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}