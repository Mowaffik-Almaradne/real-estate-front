import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { clearAuthSession, getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ApiPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

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

export class ApiClientError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.errors = errors
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    if (error.response?.status === 401) {
      clearAuthSession()
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(toApiClientError(error))
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

export { apiClient, API_URL }
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse }
