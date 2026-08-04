import {
  apiClient,
  getApiData,
  type ApiResponse,
} from "@/lib/apiClient"
import type {
  AuthResponseDto,
  LoginResponseDto,
  UserDto,
} from "@/types/dto"

export const authService = {
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const response = await apiClient.post<ApiResponse<LoginResponseDto>>("/auth/login", {
      email,
      password,
    })
    return getApiData(response)
  },

  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>("/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    return getApiData(response)
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout")
  },

  async getCurrentUser(): Promise<UserDto> {
    const response = await apiClient.get<ApiResponse<UserDto>>("/user")
    return getApiData(response)
  },

  async completeTwoFactor(code?: string, recoveryCode?: string): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponse<AuthResponseDto>>(
      "/auth/two-factor-challenge",
      {
        ...(code ? { code } : {}),
        ...(recoveryCode ? { recovery_code: recoveryCode } : {}),
      }
    )
    return getApiData(response)
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
}
