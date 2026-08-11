import {
  apiClient,
  getApiData,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  AuthSessionDto,
  CurrentUserResponse,
  LogoutResponse,
  OtpDeliveryChannel,
  OtpLoginRequest,
  OtpLoginResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  OtpVerifySuccessResponse,
  TwoFactorChallengeRequest,
  TwoFactorChallengeResponse,
  UserDto,
} from "@/types/dto"

export type OtpVerifyResult =
  | { kind: "authenticated"; session: AuthSessionDto }
  | { kind: "two_factor_required"; challengeToken: string }

export const authService = {
  async sendOtp(identifier: string): Promise<OtpLoginResponse> {
    const body: OtpLoginRequest = { identifier }
    const response = await apiClient.post<ApiResponse<OtpLoginResponse>>(
      "/auth/login",
      body
    )
    return getApiData(response)
  },

  async verifyOtp(identifier: string, code: string): Promise<OtpVerifyResult> {
    const body: OtpVerifyRequest = { identifier, code }
    const response = await apiClient.post<ApiResponse<OtpVerifyResponse>>(
      "/auth/verify-otp",
      body
    )
    const data = getApiData(response)
    if (!data) {
      throw new Error("Malformed verify-otp response")
    }
    if ("two_factor_required" in data && data.two_factor_required) {
      return {
        kind: "two_factor_required",
        challengeToken: data.challenge_token,
      }
    }
    const success = data as OtpVerifySuccessResponse
    if (!success.data) {
      throw new Error("Malformed verify-otp response")
    }
    return { kind: "authenticated", session: success.data }
  },

  async verifyTwoFactorChallenge(
    challengeToken: string,
    payload: TwoFactorChallengeRequest
  ): Promise<AuthSessionDto> {
    const response = await apiClient.post<ApiResponse<TwoFactorChallengeResponse>>(
      "/auth/two-factor-challenge",
      payload,
      { headers: { Authorization: `Bearer ${challengeToken}` } }
    )
    return getApiData(response).data
  },

  async me(): Promise<UserDto> {
    const response = await apiClient.get<ApiResponse<CurrentUserResponse>>("/user")
    return getApiData(response).data ?? getApiData(response)
  },

  async register(payload: {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
  }): Promise<AuthSessionDto> {
    const response = await apiClient.post<ApiResponse<{ data: AuthSessionDto }>>(
      "/auth/register",
      payload
    )
    return getApiData(response).data
  },

  async logout(): Promise<LogoutResponse | void> {
    try {
      const response = await apiClient.post<ApiResponse<LogoutResponse>>(
        "/auth/logout"
      )
      return getApiData(response)
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 401) {
        return
      }
      throw error
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email })
  },

  async resetPassword(
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    })
  },

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post("/auth/email/verification-notification")
  },

  async verifyEmail(id: string, hash: string, query: string): Promise<void> {
    await apiClient.get(`/auth/email/verify/${id}/${hash}?${query}`)
  },

  async updateProfile(data: { name: string; email: string }): Promise<UserDto> {
    const response = await apiClient.put<ApiResponse<{ user: UserDto }>>(
      "/auth/user/profile-information",
      data
    )
    return getApiData(response).user
  },

  async updatePublisherProfile(data: {
    name?: string
    phone?: string
    website?: string
    description?: string
    social_links?: Record<string, string>
    avatar?: string | null
  }): Promise<UserDto> {
    const payload: Record<string, unknown> = { ...data }
    if (data.avatar === null) {
      payload.avatar = null
    }
    const response = await apiClient.put<ApiResponse<UserDto>>("/publisher/profile", payload)
    return getApiData(response)
  },

  async updateContactPreference(preference: "chat" | "external"): Promise<UserDto> {
    const response = await apiClient.put<ApiResponse<UserDto>>("/publisher/contact-preference", {
      contact_preference: preference,
    })
    return getApiData(response)
  },

  async updatePassword(data: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void> {
    await apiClient.put("/auth/user/password", data)
  },

  async confirmPassword(password: string): Promise<void> {
    await apiClient.post("/auth/user/confirm-password", { password })
  },

  async enableTwoFactor(force = false): Promise<void> {
    await apiClient.post("/auth/user/two-factor-authentication", { force })
  },

  async confirmTwoFactor(code: string): Promise<void> {
    await apiClient.post("/auth/user/confirmed-two-factor-authentication", { code })
  },

  async disableTwoFactor(): Promise<void> {
    await apiClient.delete("/auth/user/two-factor-authentication")
  },

  async getTwoFactorQrCode(): Promise<{ svg: string; url?: string }> {
    const response = await apiClient.get<ApiResponse<{ svg: string; url?: string }>>(
      "/auth/user/two-factor-qr-code"
    )
    return getApiData(response)
  },

  async getTwoFactorSecretKey(): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ secretKey: string }>>(
      "/auth/user/two-factor-secret-key"
    )
    return getApiData(response).secretKey
  },

  async getRecoveryCodes(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/auth/user/two-factor-recovery-codes"
    )
    return getApiData(response)
  },

  async regenerateRecoveryCodes(): Promise<void> {
    await apiClient.post("/auth/user/two-factor-recovery-codes")
  },

  async getNotificationPreferences(): Promise<NotificationPreferencesDto> {
    const response = await apiClient.get<ApiResponse<NotificationPreferencesDto>>(
      "/user/notification-preferences"
    )
    return getApiData(response)
  },

  async updateNotificationPreferences(
    preferences: NotificationPreferencesDto
  ): Promise<NotificationPreferencesDto> {
    const response = await apiClient.put<ApiResponse<NotificationPreferencesDto>>(
      "/user/notification-preferences",
      preferences
    )
    return getApiData(response)
  },

  async getActiveSessions(): Promise<ActiveSessionDto[]> {
    const response = await apiClient.get<ApiResponse<ActiveSessionDto[]>>(
      "/user/sessions"
    )
    return getApiData(response)
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/user/sessions/${sessionId}`)
  },

  async revokeAllSessions(): Promise<void> {
    await apiClient.delete("/user/sessions")
  },

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete("/user", { data: { password } })
  },
}

export type { OtpDeliveryChannel }

export interface NotificationPreferencesDto {
  email_messages: boolean
  email_viewings: boolean
  email_property_status: boolean
  email_marketing: boolean
  push_messages: boolean
  push_viewings: boolean
  push_property_status: boolean
  push_marketing: boolean
  inapp_messages: boolean
  inapp_viewings: boolean
  inapp_property_status: boolean
  inapp_marketing: boolean
}

export interface ActiveSessionDto {
  id: string
  device: string
  browser: string
  platform: string
  ip_address: string
  location?: string | null
  last_active_at: string
  current: boolean
}
