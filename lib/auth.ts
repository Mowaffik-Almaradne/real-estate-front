export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function getCurrentUserId(): number {
  if (typeof window === "undefined") return 0

  try {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.id) return user.id
    }
  } catch {
  }

  const token = localStorage.getItem("token")
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.sub || payload.user_id || payload.id || 0
    } catch {
    }
  }

  return 0
}