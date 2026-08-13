"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiClientError } from "@/lib/apiClient"
import { appointmentService } from "../services/appointmentsService"
import type {
  Appointment,
  AppointmentCalendarEvent,
  AppointmentFilters,
  AppointmentsResponse,
} from "../types"

export interface UseAppointmentsResult {
  appointments: Appointment[]
  pagination: AppointmentsResponse["pagination"]
  loading: boolean
  error: string | null
  filters: AppointmentFilters
  setFilters: (updater: (prev: AppointmentFilters) => AppointmentFilters) => void
  refresh: () => Promise<void>
}

const EMPTY_PAGINATION: AppointmentsResponse["pagination"] = {
  current_page: 1,
  last_page: 1,
  per_page: 0,
  total: 0,
  from: null,
  to: null,
}

export function useAppointments(
  source: "all" | "mine" = "all",
  initial: AppointmentFilters = {}
): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<AppointmentsResponse["pagination"]>(
    EMPTY_PAGINATION
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<AppointmentFilters>(initial)

  const setFilters = useCallback(
    (updater: (prev: AppointmentFilters) => AppointmentFilters) => {
      setFiltersState((prev) => updater(prev))
    },
    []
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result =
        source === "mine"
          ? await appointmentService.listMine(filters)
          : await appointmentService.list(filters)
      setAppointments(result.data)
      setPagination(result.pagination)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load appointments"
      setError(message)
      setAppointments([])
      setPagination(EMPTY_PAGINATION)
    } finally {
      setLoading(false)
    }
  }, [source, filters])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    appointments,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  }
}

export function useAppointmentCalendar(from?: string, to?: string) {
  const [events, setEvents] = useState<AppointmentCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await appointmentService.getCalendar(from, to)
      setEvents(list)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load calendar"
      setError(message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { events, loading, error, refresh }
}
