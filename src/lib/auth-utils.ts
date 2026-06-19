export function getCurrentUserId(): number {
  const token = localStorage.getItem("token")
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      return user.id || 0
    } catch {
      return 0
    }
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || payload.user_id || payload.id || 0
  } catch {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      return user.id || 0
    } catch {
      return 0
    }
  }
}