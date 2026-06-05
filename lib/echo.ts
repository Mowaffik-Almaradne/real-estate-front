import Echo from "laravel-echo"
import Pusher from "pusher-js"

let echoInstance: any = null

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

export function getEcho(): any {
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

  console.log('[getEcho] Initializing with config:', { key: key.substring(0, 8) + '...', host, port, scheme })

  const pusherClient = new Pusher(key, {
    cluster: "ap1",
    forceTLS: true,
  })

  const wsHost = host ? `${scheme}://${host}${port ? `:${port}` : ""}` : undefined

  echoInstance = new Echo({
    broadcaster: "pusher",
    key,
    cluster: "ap1",
    forceTLS: true,
    client: pusherClient,
    wsHost: "",
    wsPort: 443,
    wssPort: 443,
    enabledTransports: ["ws", "wss"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorizer: (channel: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorize: (socketId: any, callback: any) => {
        const token = localStorage.getItem("token")
        console.log('[getEcho] Authorizer requesting auth for channel:', channel, 'socketId:', socketId)
        fetch("/broadcasting/auth", {
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
          .catch(() => callback({ auth: "", channel_data: "" }))
      },
    }),
  } as any)

  console.log('[getEcho] Echo instance created:', echoInstance)
  return echoInstance
}

export function destroyEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}