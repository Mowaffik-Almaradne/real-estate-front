import type { User } from "./api"

const TOKEN_KEY = "token"
const USER_KEY = "user"

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(USER_KEY)
    return value ? (JSON.parse(value) as User) : null
  } catch {
    return null
  }
}

export function setAuthSession(user: User, token: string): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax"
}

export function getCurrentUserId(): number | null {
  return getStoredUser()?.id ?? null
}
