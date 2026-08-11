import { describe, it, expect, vi, beforeEach } from "vitest"
import { ApiClientError } from "@/lib/apiClient"
import { authService } from "@/services/auth-service"

const mockPost = vi.fn()
const mockGet = vi.fn()
const mockPut = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getApiData: <T,>(response: { data: unknown }) => {
    const payload = response.data as { data?: T }
    return (payload?.data ?? (response.data as T)) as T
  },
  getApiPagination: () => undefined,
  ApiClientError: class ApiClientError extends Error {
    status: number
    errors: Record<string, string[]>
    constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
      super(message)
      this.status = status
      this.errors = errors
    }
  },
}))

const user = { id: 1, name: "Jane", email: "jane@example.com" }
const session = { data: { user, token: "tok" } }

describe("authService HTTP contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("sendOtp", () => {
    it("POSTs the identifier to /auth/login", async () => {
      const otp = { message: "OTP sent", channel: "email", identifier: "jane@example.com" }
      mockPost.mockResolvedValueOnce({ data: { data: otp } })
      const result = await authService.sendOtp("jane@example.com")
      expect(mockPost).toHaveBeenCalledWith("/auth/login", { identifier: "jane@example.com" })
      expect(result).toEqual(otp)
    })

    it("propagates 422 validation errors from the backend", async () => {
      mockPost.mockRejectedValueOnce(
        new ApiClientError(422, "The given data was invalid.", {
          identifier: ["No account matches this identifier."],
        })
      )
      await expect(authService.sendOtp("unknown@example.com")).rejects.toBeInstanceOf(ApiClientError)
    })
  })

  describe("verifyOtp", () => {
    it("returns the authenticated session on success", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: session } })
      const result = await authService.verifyOtp("jane@example.com", "123456")
      expect(mockPost).toHaveBeenCalledWith("/auth/verify-otp", {
        identifier: "jane@example.com",
        code: "123456",
      })
      expect(result.kind).toBe("authenticated")
      if (result.kind === "authenticated") {
        expect(result.session).toEqual(session.data)
      }
    })

    it("returns a two_factor_required result when the backend requests 2FA", async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          data: {
            message: "OTP verified. Two-factor challenge required.",
            two_factor_required: true,
            challenge_token: "challenge-xyz",
          },
        },
      })
      const result = await authService.verifyOtp("jane@example.com", "123456")
      expect(result.kind).toBe("two_factor_required")
      if (result.kind === "two_factor_required") {
        expect(result.challengeToken).toBe("challenge-xyz")
      }
    })

    it("propagates 422 invalid-otp errors", async () => {
      mockPost.mockRejectedValueOnce(
        new ApiClientError(422, "Invalid or expired OTP code.", {
          code: ["Invalid or expired OTP code."],
        })
      )
      await expect(authService.verifyOtp("jane@example.com", "000000")).rejects.toBeInstanceOf(ApiClientError)
    })

    it("propagates 429 rate-limit errors", async () => {
      mockPost.mockRejectedValueOnce(new ApiClientError(429, "Too many attempts."))
      await expect(authService.verifyOtp("jane@example.com", "000000")).rejects.toBeInstanceOf(ApiClientError)
    })
  })

  describe("verifyTwoFactorChallenge", () => {
    it("POSTs the code with the challenge token in the Authorization header", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: session } })
      const result = await authService.verifyTwoFactorChallenge("challenge-xyz", { code: "654321" })
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/two-factor-challenge",
        { code: "654321" },
        { headers: { Authorization: "Bearer challenge-xyz" } }
      )
      expect(result).toEqual(session.data)
    })

    it("POSTs the recovery_code when the code is omitted", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: session } })
      await authService.verifyTwoFactorChallenge("challenge-xyz", {
        recovery_code: "RECOVERY-CODE-1",
      })
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/two-factor-challenge",
        { recovery_code: "RECOVERY-CODE-1" },
        { headers: { Authorization: "Bearer challenge-xyz" } }
      )
    })
  })

  describe("me", () => {
    it("GETs /user and unwraps the data envelope", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: user } })
      const result = await authService.me()
      expect(mockGet).toHaveBeenCalledWith("/user")
      expect(result).toEqual(user)
    })
  })

  describe("register", () => {
    it("POSTs the new user payload to /auth/register and returns the session", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: session } })
      const result = await authService.register({
        name: "Jane",
        email: "jane@example.com",
        password: "secret123",
        password_confirmation: "secret123",
      })
      expect(mockPost).toHaveBeenCalledWith("/auth/register", {
        name: "Jane",
        email: "jane@example.com",
        password: "secret123",
        password_confirmation: "secret123",
      })
      expect(result).toEqual(session.data)
    })

    it("forwards the optional phone field when provided", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: session } })
      await authService.register({
        name: "Jane",
        email: "jane@example.com",
        phone: "+212600000001",
        password: "secret123",
        password_confirmation: "secret123",
      })
      const [, payload] = mockPost.mock.calls[0]
      expect(payload).toMatchObject({ phone: "+212600000001" })
    })
  })

  describe("logout", () => {
    it("POSTs to /auth/logout", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: { message: "Logged out." } } })
      await authService.logout()
      expect(mockPost).toHaveBeenCalledWith("/auth/logout")
    })

    it("swallows 401 responses to allow client-side cleanup", async () => {
      mockPost.mockRejectedValueOnce(new ApiClientError(401, "Unauthenticated."))
      await expect(authService.logout()).resolves.toBeUndefined()
    })

    it("rethrows non-401 errors", async () => {
      mockPost.mockRejectedValueOnce(new ApiClientError(500, "boom"))
      await expect(authService.logout()).rejects.toBeInstanceOf(ApiClientError)
    })
  })

  describe("password reset flow", () => {
    it("requestPasswordReset POSTs the email to /auth/forgot-password", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.requestPasswordReset("jane@example.com")
      expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "jane@example.com",
      })
    })

    it("resetPassword POSTs email, token, password and password_confirmation", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.resetPassword("jane@example.com", "tok-1", "newpass", "newpass")
      expect(mockPost).toHaveBeenCalledWith("/auth/reset-password", {
        email: "jane@example.com",
        token: "tok-1",
        password: "newpass",
        password_confirmation: "newpass",
      })
    })
  })

  describe("email verification", () => {
    it("resendVerificationEmail POSTs to /auth/email/verification-notification with no body", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.resendVerificationEmail()
      expect(mockPost).toHaveBeenCalledWith("/auth/email/verification-notification")
    })

    it("verifyEmail GETs the signed URL with the query string appended", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: null } })
      await authService.verifyEmail("42", "hash-abc", "expires=1234&signature=xyz")
      expect(mockGet).toHaveBeenCalledWith(
        "/auth/email/verify/42/hash-abc?expires=1234&signature=xyz"
      )
    })
  })

  describe("profile information", () => {
    it("updateProfile PUTs name and email, returns the user", async () => {
      const updated = { id: 1, name: "New Name", email: "new@example.com" }
      mockPut.mockResolvedValueOnce({ data: { data: { user: updated } } })
      const result = await authService.updateProfile({ name: "New Name", email: "new@example.com" })
      expect(mockPut).toHaveBeenCalledWith("/auth/user/profile-information", {
        name: "New Name",
        email: "new@example.com",
      })
      expect(result).toEqual(updated)
    })
  })

  describe("publisher profile", () => {
    it("updatePublisherProfile PUTs the payload to /publisher/profile", async () => {
      const updated = { id: 1, name: "Publisher" }
      mockPut.mockResolvedValueOnce({ data: { data: updated } })
      const result = await authService.updatePublisherProfile({
        name: "Publisher",
        phone: "+123456789",
        website: "https://example.com",
      })
      expect(mockPut).toHaveBeenCalledWith("/publisher/profile", {
        name: "Publisher",
        phone: "+123456789",
        website: "https://example.com",
        social_links: undefined,
        avatar: undefined,
      })
      expect(result).toEqual(updated)
    })

    it("updatePublisherProfile preserves an explicit null avatar", async () => {
      mockPut.mockResolvedValueOnce({ data: { data: { id: 1 } } })
      await authService.updatePublisherProfile({ avatar: null })
      const [, payload] = mockPut.mock.calls[0]
      expect(payload).toMatchObject({ avatar: null })
    })

    it("updateContactPreference PUTs the preference to /publisher/contact-preference", async () => {
      const updated = { id: 1, contact_preference: "external" }
      mockPut.mockResolvedValueOnce({ data: { data: updated } })
      const result = await authService.updateContactPreference("external")
      expect(mockPut).toHaveBeenCalledWith("/publisher/contact-preference", {
        contact_preference: "external",
      })
      expect(result).toEqual(updated)
    })
  })

  describe("password update and confirmation", () => {
    it("updatePassword PUTs current and new password to /auth/user/password", async () => {
      mockPut.mockResolvedValueOnce({ data: { data: null } })
      await authService.updatePassword({
        current_password: "old",
        password: "newpass",
        password_confirmation: "newpass",
      })
      expect(mockPut).toHaveBeenCalledWith("/auth/user/password", {
        current_password: "old",
        password: "newpass",
        password_confirmation: "newpass",
      })
    })

    it("confirmPassword POSTs the password to /auth/user/confirm-password", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.confirmPassword("secret")
      expect(mockPost).toHaveBeenCalledWith("/auth/user/confirm-password", { password: "secret" })
    })
  })

  describe("two-factor management", () => {
    it("enableTwoFactor POSTs with default force=false", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.enableTwoFactor()
      expect(mockPost).toHaveBeenCalledWith("/auth/user/two-factor-authentication", { force: false })
    })

    it("enableTwoFactor forwards force=true when requested", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.enableTwoFactor(true)
      expect(mockPost).toHaveBeenCalledWith("/auth/user/two-factor-authentication", { force: true })
    })

    it("confirmTwoFactor POSTs the code", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.confirmTwoFactor("123456")
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/user/confirmed-two-factor-authentication",
        { code: "123456" }
      )
    })

    it("disableTwoFactor DELETEs the endpoint", async () => {
      mockDelete.mockResolvedValueOnce({ data: { data: null } })
      await authService.disableTwoFactor()
      expect(mockDelete).toHaveBeenCalledWith("/auth/user/two-factor-authentication")
    })

    it("getTwoFactorQrCode GETs the QR code endpoint and unwraps the payload", async () => {
      const payload = { svg: "<svg/>", url: "otpauth://..." }
      mockGet.mockResolvedValueOnce({ data: { data: payload } })
      const result = await authService.getTwoFactorQrCode()
      expect(mockGet).toHaveBeenCalledWith("/auth/user/two-factor-qr-code")
      expect(result).toEqual(payload)
    })

    it("getTwoFactorSecretKey unwraps the secretKey field", async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { secretKey: "ABCDEFGH" } } })
      const result = await authService.getTwoFactorSecretKey()
      expect(mockGet).toHaveBeenCalledWith("/auth/user/two-factor-secret-key")
      expect(result).toBe("ABCDEFGH")
    })

    it("getRecoveryCodes returns the array of codes", async () => {
      const codes = ["code-1", "code-2"]
      mockGet.mockResolvedValueOnce({ data: { data: codes } })
      const result = await authService.getRecoveryCodes()
      expect(mockGet).toHaveBeenCalledWith("/auth/user/two-factor-recovery-codes")
      expect(result).toEqual(codes)
    })

    it("regenerateRecoveryCodes POSTs to the recovery-codes endpoint", async () => {
      mockPost.mockResolvedValueOnce({ data: { data: null } })
      await authService.regenerateRecoveryCodes()
      expect(mockPost).toHaveBeenCalledWith("/auth/user/two-factor-recovery-codes")
    })
  })
})
