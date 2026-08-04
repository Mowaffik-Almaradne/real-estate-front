import { useEffect, useMemo } from "react"

export function useAbortController(): AbortController {
  const controller = useMemo(() => new AbortController(), [])

  useEffect(() => {
    return () => {
      controller.abort()
    }
  }, [controller])

  return controller
}

export function withSignal<T extends { signal?: AbortSignal }>(config: T, signal?: AbortSignal): T {
  if (!signal) return config
  return { ...config, signal }
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number; shouldRetry?: (error: unknown) => boolean } = {}
): Promise<T> {
  const { attempts = 3, delayMs = 500, shouldRetry } = options
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      if (shouldRetry && !shouldRetry(error)) break
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }

  throw lastError
}
