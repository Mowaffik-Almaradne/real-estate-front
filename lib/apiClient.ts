import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { env } from "./env"
import { clearAuthSession, getAuthToken } from "./auth"
import type { ApiPagination } from "@/types/common"

export type { ApiPagination }

export interface ApiResponse<T> {
  data: T
  message?: string | null
  success?: boolean
  pagination?: ApiPagination
  meta?: ApiPagination
}

export interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

export type ApiRequestOptions = {
  silent?: boolean
  signal?: AbortSignal
}

export class ApiClientError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.errors = errors
  }

  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }

  isValidation(): boolean {
    return this.status === 422
  }

  isUnauthorized(): boolean {
    return this.status === 401
  }

  isForbidden(): boolean {
    return this.status === 403
  }

  isNotFound(): boolean {
    return this.status === 404
  }

  isServerError(): boolean {
    return this.status >= 500
  }
}

type ErrorListener = (error: ApiClientError) => void
const errorListeners = new Set<ErrorListener>()

export function onApiError(listener: ErrorListener): () => void {
  errorListeners.add(listener)
  return () => {
    errorListeners.delete(listener)
  }
}

function emitError(error: ApiClientError): void {
  for (const listener of errorListeners) {
    try {
      listener(error)
    } catch {
    }
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers.Accept = "application/json"
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiClientError(error)

    if (apiError.isUnauthorized()) {
      clearAuthSession()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?callbackUrl=${callbackUrl}`
      }
    }

    const config = (error as AxiosError).config as (AxiosRequestConfig & { silent?: boolean }) | undefined
    if (!config?.silent) {
      emitError(apiError)
    }

    return Promise.reject(apiError)
  }
)

function toApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error

  const axiosError = error as AxiosError<ApiErrorPayload>
  const status = axiosError.response?.status ?? 0
  const payload = axiosError.response?.data
  const message = payload?.message || axiosError.message || "Request failed"

  return new ApiClientError(status, message, payload?.errors ?? {})
}

export function getApiData<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
  const payload = response.data
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as ApiResponse<T>).data
    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      ("pagination" in data || "meta" in data)
    ) {
      return (data as { data: T }).data
    }
    return data
  }
  return payload as T
}

export function getApiPagination<T>(
  response: AxiosResponse<ApiResponse<T[]>>
): ApiPagination | undefined {
  const payload = response.data
  if (payload.pagination ?? payload.meta) {
    return payload.pagination ?? payload.meta
  }

  const nested = payload.data
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const nestedPayload = nested as { pagination?: ApiPagination; meta?: ApiPagination }
    return nestedPayload.pagination ?? nestedPayload.meta
  }

  return undefined
}

export function toFormErrors<T extends Record<string, unknown>>(
  errors: Record<string, string[]>
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {}
  for (const [key, messages] of Object.entries(errors)) {
    if (messages && messages.length > 0) {
      result[key as keyof T] = messages[0]
    }
  }
  return result
}

export function firstError(errors: Record<string, string[]>): string | undefined {
  for (const messages of Object.values(errors)) {
    if (messages && messages.length > 0) return messages[0]
  }
  return undefined
}

export { apiClient, env as apiEnv }
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse }
