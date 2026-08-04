"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { AuthResponseDto, LoginResponseDto, UserDto } from "@/types/dto"
import { authService } from "@/services/auth-service"
import { clearAuthSession, getStoredUser, getAuthToken, setAuthSession } from "@/lib/auth"

interface AuthContextType {
  user: UserDto | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<"authenticated" | "two_factor">
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>
  logout: () => Promise<void>
  completeTwoFactor: (code?: string, recoveryCode?: string) => Promise<void>
  refreshUser: () => Promise<UserDto | null>
  updateUser: (user: UserDto) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = getAuthToken()
      const storedUser = getStoredUser()
      if (storedToken) {
        setToken(storedToken)
        if (storedUser) setUser(storedUser)
        void authService.getCurrentUser().then((currentUser) => {
          setUser(currentUser)
          setAuthSession(currentUser, storedToken)
        }).catch(() => {
          // The API client handles invalid sessions. Keep cached state for transient failures.
        })
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<"authenticated" | "two_factor"> => {
    const response = await authService.login(email, password)
    if (isAuthenticatedResponse(response)) {
      setUser(response.user)
      setToken(response.token)
      setAuthSession(response.user, response.token)
      return "authenticated"
    }

    return "two_factor"
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const response = await authService.register(name, email, password, passwordConfirmation)
    setUser(response.user)
    setToken(response.token)
    setAuthSession(response.user, response.token)
  }

  const completeTwoFactor = async (code?: string, recoveryCode?: string): Promise<void> => {
    const response = await authService.completeTwoFactor(code, recoveryCode)
    setUser(response.user)
    setToken(response.token)
    setAuthSession(response.user, response.token)
  }

  const refreshUser = async (): Promise<UserDto | null> => {
    const currentToken = getAuthToken()
    if (!currentToken) return null
    const currentUser = await authService.getCurrentUser()
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
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    completeTwoFactor,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function isAuthenticatedResponse(response: LoginResponseDto): response is AuthResponseDto {
  return "token" in response && "user" in response
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
