import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { env, getBroadcastingAuthUrl } from "./env"
import { getAuthToken } from "./auth"

type EchoInstance = Echo<"pusher">
type AuthResponse = { auth: string; channel_data?: string }
type AuthorizerCallback = (error: Error | null, data: AuthResponse) => void

let echoInstance: EchoInstance | null = null
let echoToken: string | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function getEcho(): EchoInstance | null {
  if (!isBrowser()) return null

  const token = getAuthToken()
  if (!token) return null

  if (echoInstance && echoToken === token) return echoInstance
  destroyEcho()

  if (!env.pusher.key) return null

  echoInstance = new Echo<"pusher">({
    broadcaster: "pusher",
    key: env.pusher.key,
    cluster: env.pusher.cluster,
    forceTLS: env.pusher.forceTLS,
    authorizer: (channel: { name: string }) => ({
      authorize: async (socketId: string, callback: AuthorizerCallback) => {
        try {
          const response = await fetch(getBroadcastingAuthUrl(), {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })

          if (!response.ok) {
            throw new Error(`Pusher authorization failed (${response.status})`)
          }

          callback(null, (await response.json()) as AuthResponse)
        } catch (error) {
          callback(error instanceof Error ? error : new Error("Pusher authorization failed"), {
            auth: "",
          })
        }
      },
    }),
  })
  echoToken = token

  return echoInstance
}

export function destroyEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
  echoToken = null
}

export function getPusherConnection(echo: EchoInstance | null): Pusher | null {
  if (!echo) return null
  const client = echo as unknown as { pusher?: Pusher }
  return client.pusher ?? null
}
