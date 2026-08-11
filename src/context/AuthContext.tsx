"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { AuthSessionDto, UserDto } from "@/types/dto"
import { authService, type OtpVerifyResult } from "@/services/auth-service"
import { clearAuthSession, getStoredUser, getAuthToken, setAuthSession } from "@/lib/auth"
import { setSentryUser } from "@/lib/sentry"

export type LoginStep = "send_otp" | "verify_otp"

interface PendingTwoFactor {
  challengeToken: string
  identifier: string
}

export interface SendOtpResult {
  step: "send_otp"
  identifier: string
}

export interface TwoFactorPrompt {
  step: "two_factor_required"
  challengeToken: string
  identifier: string
}

interface AuthContextType {
  user: UserDto | null
  token: string | null
  isLoading: boolean
  sendOtp: (identifier: string) => Promise<SendOtpResult>
  verifyOtp: (identifier: string, code: string) => Promise<void>
  verifyTwoFactor: (code?: string, recoveryCode?: string) => Promise<void>
  pendingTwoFactor: PendingTwoFactor | null
  cancelTwoFactor: () => void
  register: (input: {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<UserDto | null>
  updateUser: (user: UserDto) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function applySession(
  setUser: (u: UserDto | null) => void,
  setToken: (t: string | null) => void,
  session: AuthSessionDto
) {
  setUser(session.user)
  setToken(session.token)
  setAuthSession(session.user, session.token)
  setSentryUser({ id: session.user.id, email: session.user.email })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => {
    try {
      return getStoredUser()
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    try {
      return getAuthToken()
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return getAuthToken() !== null
    } catch {
      return true
    }
  })
  const [pendingTwoFactor, setPendingTwoFactor] = useState<PendingTwoFactor | null>(null)

  useEffect(() => {
    const storedToken = getAuthToken()
    if (!storedToken) {
      setSentryUser(null)
      return
    }

    void authService.me().then((currentUser: UserDto) => {
      setUser(currentUser)
      setAuthSession(currentUser, storedToken)
      setSentryUser({ id: currentUser.id, email: currentUser.email })
    }).catch(() => {
      setSentryUser(null)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (user) {
      setSentryUser({ id: user.id, email: user.email })
    } else {
      setSentryUser(null)
    }
  }, [user])

  const sendOtp = async (identifier: string): Promise<SendOtpResult> => {
    const trimmed = identifier.trim()
    const response = await authService.sendOtp(trimmed)
    return { step: "send_otp", identifier: response.identifier ?? trimmed }
  }

  const verifyOtp = async (identifier: string, code: string): Promise<void> => {
    const result: OtpVerifyResult = await authService.verifyOtp(identifier.trim(), code)
    if (result.kind === "two_factor_required") {
      setPendingTwoFactor({ challengeToken: result.challengeToken, identifier })
      return
    }
    setPendingTwoFactor(null)
    applySession(setUser, setToken, result.session)
  }

  const verifyTwoFactor = async (code?: string, recoveryCode?: string): Promise<void> => {
    if (!pendingTwoFactor) {
      throw new Error("No pending two-factor challenge")
    }
    const payload: { code?: string; recovery_code?: string } = {}
    if (code) payload.code = code
    else if (recoveryCode) payload.recovery_code = recoveryCode
    const session = await authService.verifyTwoFactorChallenge(
      pendingTwoFactor.challengeToken,
      payload
    )
    setPendingTwoFactor(null)
    applySession(setUser, setToken, session)
  }

  const cancelTwoFactor = (): void => {
    setPendingTwoFactor(null)
  }

  const register = async (input: {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
  }): Promise<void> => {
    const session = await authService.register(input)
    applySession(setUser, setToken, session)
  }

  const refreshUser = async (): Promise<UserDto | null> => {
    const currentToken = getAuthToken()
    if (!currentToken) return null
    const currentUser = await authService.me()
    setUser(currentUser)
    setAuthSession(currentUser, currentToken)
    return currentUser
  }

  const updateUser = (updatedUser: UserDto): void => {
    const currentToken = getAuthToken()
    setUser(updatedUser)
    if (currentToken) setAuthSession(updatedUser, currentToken)
  }

  const logout = async (): Promise<void> => {
    try {
      if (getAuthToken()) await authService.logout()
    } finally {
      setUser(null)
      setToken(null)
      clearAuthSession()
      setSentryUser(null)
      setPendingTwoFactor(null)
      window.location.href = "/login"
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    sendOtp,
    verifyOtp,
    verifyTwoFactor,
    pendingTwoFactor,
    cancelTwoFactor,
    register,
    logout,
    refreshUser,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
