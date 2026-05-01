import { apiClient } from "lib/apiClient"

export interface FcmRegisterRequest {
  readonly token: string
  readonly device_type: "web"
  readonly device_name?: string
  readonly app_version?: string
}

export class FcmServiceError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "FcmServiceError"
    this.status = status
  }
}

const FCM_TOKEN_KEY = "fcm_token"

export const fcmService = {
  async registerFcmToken(
    token: string,
    deviceType: "web" = "web",
    deviceName?: string
  ): Promise<void> {
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
    const request: FcmRegisterRequest = {
      token,
      device_type: deviceType,
      ...(deviceName ? { device_name: deviceName } : {}),
      ...(appVersion ? { app_version: appVersion } : {}),
    }

    await apiClient.post("/api/v1/fcm/register", request)
    localStorage.setItem(FCM_TOKEN_KEY, token)
  },

  async revokeFcmToken(token: string): Promise<void> {
    try {
      await apiClient.delete("/api/v1/fcm/revoke", { data: { token } })
    } finally {
      localStorage.removeItem(FCM_TOKEN_KEY)
    }
  },

  getStoredToken(): string | null {
    if (typeof window === "undefined") {
      return null
    }
    return localStorage.getItem(FCM_TOKEN_KEY)
  },
}