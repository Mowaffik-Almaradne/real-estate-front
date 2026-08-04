"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { onApiError, type ApiClientError } from "@/lib/apiClient"

const MUTED_STATUSES = new Set([401, 404])

function describeError(error: ApiClientError): string {
  if (error.isValidation()) {
    return error.message || "Please review the highlighted fields."
  }
  if (error.isForbidden()) return "You do not have permission to perform this action."
  if (error.isNotFound()) return "The requested resource was not found."
  if (error.isServerError()) return "An unexpected server error occurred. Please try again."
  if (error.status === 0) return "Network error. Check your connection and try again."
  return error.message || "Request failed"
}

export function ApiErrorListener() {
  useEffect(() => {
    return onApiError((error) => {
      if (MUTED_STATUSES.has(error.status)) return
      toast.error(describeError(error), { description: `Status ${error.status}` })
    })
  }, [])

  return null
}
