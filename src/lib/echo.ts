import Echo from "laravel-echo"
import Pusher from "pusher-js"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<"pusher"> | null = null

function isServer(): boolean {
  return typeof window === "undefined"
}

export function getEcho(): Echo<"pusher"> | null {
  if (isServer()) {
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER

  if (!pusherKey) {
    console.warn("Pusher app key not configured. WebSocket disabled.")
    return null
  }

  const token = localStorage.getItem("token")

  echoInstance = new Echo<"pusher">({
    broadcaster: "pusher",
    key: pusherKey,
    cluster: pusherCluster || "mt1",
    forceTLS: true,
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (err: Error | null, data: { auth: string; channel_data?: string }) => void) => {
        fetch("/api/broadcasting/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((res) => res.json())
          .then((data) => callback(null, data))
          .catch((err) => callback(err as Error, { auth: "", channel_data: "" }))
      },
    }),
  })

  return echoInstance
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

export function getPusherConnection(echo: Echo<"pusher"> | null): Pusher | null {
  if (!echo) return null
  const echoAny = echo as unknown as { pusher: Pusher }
  return echoAny.pusher ?? null
}