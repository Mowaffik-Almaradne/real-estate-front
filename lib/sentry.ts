"use client"

import * as Sentry from "@sentry/nextjs"
import type { ApiClientError } from "@/lib/apiClient"

const CAPTURED_STATUSES = new Set([403, 500, 502, 503, 504])

export function isCapturableApiError(error: ApiClientError): boolean {
  return CAPTURED_STATUSES.has(error.status) || error.isServerError()
}

export function reportApiError(error: ApiClientError, context?: Record<string, unknown>): void {
  if (!isCapturableApiError(error)) return
  Sentry.captureException(error, {
    tags: {
      api_error: "true",
      status_code: String(error.status),
    },
    extra: context,
  })
}

export function setSentryUser(user: { id: number | string; email: string } | null): void {
  if (user) {
    Sentry.setUser({ id: String(user.id), email: user.email })
  } else {
    Sentry.setUser(null)
  }
}

export function reportHandledException(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context })
}
