"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { User, login as apiLogin, register as apiRegister } from "@/lib/api"
import { clearAuthSession, getStoredUser, getAuthToken, setAuthSession } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = getAuthToken()
      const storedUser = getStoredUser()
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    setUser(response.data.user)
    setToken(response.data.token)
    setAuthSession(response.data.user, response.data.token)
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const response = await apiRegister(name, email, password, passwordConfirmation)
    setUser(response.data.user)
    setToken(response.data.token)
    setAuthSession(response.data.user, response.data.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearAuthSession()
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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
