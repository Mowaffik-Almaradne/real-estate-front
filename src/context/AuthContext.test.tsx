import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import type { AuthSessionDto, UserDto } from "@/types/dto"
import { AuthProvider, useAuth } from "./AuthContext"

const mockGetStoredUser = vi.fn()
const mockGetAuthToken = vi.fn()
const mockSetAuthSession = vi.fn()
const mockClearAuthSession = vi.fn()

const mockSendOtp = vi.fn()
const mockVerifyOtp = vi.fn()
const mockVerifyTwoFactor = vi.fn()
const mockMe = vi.fn()
const mockRegister = vi.fn()

vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
  getAuthToken: () => mockGetAuthToken(),
  setAuthSession: (...args: unknown[]) => mockSetAuthSession(...args),
  clearAuthSession: () => mockClearAuthSession(),
}))

vi.mock("@/services/auth-service", () => ({
  authService: {
    sendOtp: (...args: unknown[]) => mockSendOtp(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    verifyTwoFactorChallenge: (...args: unknown[]) => mockVerifyTwoFactor(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    me: () => mockMe(),
    logout: vi.fn(),
  },
}))

const profile = (overrides: Partial<UserDto> = {}): UserDto => ({
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  email_verified_at: null,
  created_at: "2026-08-02 10:00:00",
  updated_at: "2026-08-02 10:00:00",
  ...overrides,
})

const session = (token: string): AuthSessionDto => ({ user: profile(), token })

function renderAuth() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
  })
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStoredUser.mockReturnValue(null)
    mockGetAuthToken.mockReturnValue(null)
    mockMe.mockResolvedValue(profile())
  })

  it("starts not loading when there is no stored token", async () => {
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.pendingTwoFactor).toBeNull()
  })

  it("hydrates user/token from storage and fetches the current user on mount", async () => {
    const storedUser = profile({ name: "Stored" })
    mockGetStoredUser.mockReturnValue(storedUser)
    mockGetAuthToken.mockReturnValue("stored-token")
    mockMe.mockResolvedValue(profile({ name: "Fresh" }))

    const { result } = renderAuth()
    await waitFor(() => expect(result.current.user?.name).toBe("Fresh"))
    expect(result.current.token).toBe("stored-token")
    expect(mockMe).toHaveBeenCalled()
    expect(mockSetAuthSession).toHaveBeenCalledWith(profile({ name: "Fresh" }), "stored-token")
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it("does not call me() when there is no stored token", async () => {
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockMe).not.toHaveBeenCalled()
  })

  it("sendOtp returns the echoed identifier on success", async () => {
    mockSendOtp.mockResolvedValue({
      message: "OTP sent",
      channel: "email",
      identifier: "jane@example.com",
    })
    const { result } = renderAuth()
    let res: Awaited<ReturnType<typeof result.current.sendOtp>> | undefined
    await act(async () => {
      res = await result.current.sendOtp("jane@example.com")
    })
    expect(res?.step).toBe("send_otp")
    expect(res?.identifier).toBe("jane@example.com")
    expect(mockSendOtp).toHaveBeenCalledWith("jane@example.com")
  })

  it("verifyOtp persists the session on success", async () => {
    mockVerifyOtp.mockResolvedValue({ kind: "authenticated", session: session("tok-otp") })
    const { result } = renderAuth()
    await act(async () => {
      await result.current.verifyOtp("jane@example.com", "123456")
    })
    expect(result.current.user?.email).toBe("jane@example.com")
    expect(result.current.token).toBe("tok-otp")
    expect(mockSetAuthSession).toHaveBeenCalledWith(profile(), "tok-otp")
    expect(result.current.pendingTwoFactor).toBeNull()
  })

  it("verifyOtp stores a pending two-factor challenge without persisting a session", async () => {
    mockVerifyOtp.mockResolvedValue({
      kind: "two_factor_required",
      challengeToken: "challenge-xyz",
    })
    const { result } = renderAuth()
    await act(async () => {
      await result.current.verifyOtp("jane@example.com", "123456")
    })
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.pendingTwoFactor).toEqual({
      challengeToken: "challenge-xyz",
      identifier: "jane@example.com",
    })
    expect(mockSetAuthSession).not.toHaveBeenCalled()
  })

  it("verifyTwoFactor persists the session and clears the pending challenge", async () => {
    mockVerifyOtp.mockResolvedValue({
      kind: "two_factor_required",
      challengeToken: "challenge-xyz",
    })
    mockVerifyTwoFactor.mockResolvedValue(session("tok-2fa"))
    const { result } = renderAuth()
    await act(async () => {
      await result.current.verifyOtp("jane@example.com", "123456")
    })
    expect(result.current.pendingTwoFactor).not.toBeNull()
    await act(async () => {
      await result.current.verifyTwoFactor("000111")
    })
    expect(result.current.token).toBe("tok-2fa")
    expect(result.current.pendingTwoFactor).toBeNull()
    expect(mockVerifyTwoFactor).toHaveBeenCalledWith(
      "challenge-xyz",
      { code: "000111" }
    )
    expect(mockSetAuthSession).toHaveBeenCalledWith(profile(), "tok-2fa")
  })

  it("cancelTwoFactor clears the pending challenge", async () => {
    mockVerifyOtp.mockResolvedValue({
      kind: "two_factor_required",
      challengeToken: "challenge-xyz",
    })
    const { result } = renderAuth()
    await act(async () => {
      await result.current.verifyOtp("jane@example.com", "123456")
    })
    expect(result.current.pendingTwoFactor).not.toBeNull()
    act(() => result.current.cancelTwoFactor())
    expect(result.current.pendingTwoFactor).toBeNull()
  })

  it("verifyTwoFactor throws when no pending challenge exists", async () => {
    const { result } = renderAuth()
    await expect(
      result.current.verifyTwoFactor("000111")
    ).rejects.toThrow(/pending two-factor/i)
  })

  it("register persists the returned session", async () => {
    mockRegister.mockResolvedValue(session("tok-reg"))
    const { result } = renderAuth()
    await act(async () => {
      await result.current.register({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secret123",
        password_confirmation: "secret123",
      })
    })
    expect(result.current.user?.name).toBe("Jane Doe")
    expect(result.current.token).toBe("tok-reg")
    expect(mockSetAuthSession).toHaveBeenCalledWith(profile(), "tok-reg")
  })
})
