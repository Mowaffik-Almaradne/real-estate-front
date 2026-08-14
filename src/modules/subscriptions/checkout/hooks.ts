"use client"

import { useCallback, useState } from "react"
import { checkoutService } from "./service"
import type { CheckoutRequest, CheckoutResponse } from "./types"
import { ApiClientError } from "@/lib/apiClient"

export interface UseCheckoutResult {
  result: CheckoutResponse | null
  loading: boolean
  error: string | null
  start: (request: CheckoutRequest) => Promise<CheckoutResponse>
  reset: () => void
}

/**
 * Wrapper around `POST /api/checkout`. The frontend does NOT pretend the
 * payment succeeded — it follows whatever the documented response says
 * (either a redirect URL or a completed subscription summary).
 */
export function useCheckout(): UseCheckoutResult {
  const [result, setResult] = useState<CheckoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(
    async (request: CheckoutRequest): Promise<CheckoutResponse> => {
      setLoading(true)
      setError(null)
      try {
        const response = await checkoutService.start(request)
        setResult(response)
        return response
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Failed to start checkout"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, start, reset }
}
