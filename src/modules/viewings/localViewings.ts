import type { PropertyViewingDto, CreateViewingRequest, CalendarViewingEvent } from "@/types/dto"
import { ViewingStatus, ViewingType } from "@/types/enums"
import type { UserDto } from "@/types/dto"
import { getUserPermissions, isSuperAdmin } from "@/lib/permissions"

const STORAGE_KEY = "viewings:local:v1"
const API_DENIED_KEY = "viewings:api-denied:v1"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function canUseSession(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
}

function readAll(): PropertyViewingDto[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as PropertyViewingDto[]) : []
  } catch {
    return []
  }
}

function writeAll(items: PropertyViewingDto[]): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    void 0
  }
}

/** Remember that this session got 403 on dashboard viewings/appointments. */
export function markViewingsApiDenied(): void {
  if (!canUseSession()) return
  try {
    window.sessionStorage.setItem(API_DENIED_KEY, "1")
  } catch {
    void 0
  }
}

export function isViewingsApiDenied(): boolean {
  if (!canUseSession()) return false
  try {
    return window.sessionStorage.getItem(API_DENIED_KEY) === "1"
  } catch {
    return false
  }
}

/**
 * OpenAPI dashboard viewings/calendar & schedule require `viewings.list`
 * (or appointments.* on newer backends). Without it the API returns 403.
 */
export function canListViewingsFromApi(user: UserDto | null): boolean {
  if (isViewingsApiDenied()) return false
  if (!user) return false
  if (isSuperAdmin(user)) return true
  // No roles payload → allow one probe; 403 will mark denied for the session.
  if (user.roles === undefined) return true
  if (user.roles.length === 0) return true
  const perms = getUserPermissions(user)
  // Roles exist but no permission grants loaded → treat as no list access.
  if (perms.length === 0) return false
  return (
    perms.includes("viewings.list") ||
    perms.includes("appointments.list") ||
    perms.includes("viewings.show") ||
    perms.includes("appointments.show")
  )
}

export function listLocalViewings(status?: ViewingStatus): PropertyViewingDto[] {
  const items = readAll().sort((a, b) =>
    String(b.scheduled_at).localeCompare(String(a.scheduled_at))
  )
  if (!status) return items
  return items.filter((item) => item.status === status)
}

export function upsertLocalViewing(viewing: PropertyViewingDto): PropertyViewingDto {
  const items = readAll().filter((item) => item.id !== viewing.id)
  items.unshift(viewing)
  writeAll(items)
  return viewing
}

export function createLocalViewing(
  request: CreateViewingRequest,
  userId: number
): PropertyViewingDto {
  const now = new Date().toISOString()
  const viewing: PropertyViewingDto = {
    id: -Date.now(),
    property_id: request.property_id,
    user_id: userId,
    scheduled_at: request.scheduled_at,
    duration_minutes: request.duration_minutes ?? 60,
    buffer_minutes: request.buffer_minutes ?? 15,
    viewing_type: request.viewing_type ?? ViewingType.in_person,
    status: ViewingStatus.pending,
    max_attendees: request.max_attendees ?? 1,
    contact_name: request.contact_name ?? null,
    contact_phone: request.contact_phone ?? null,
    notes: request.notes ?? null,
    created_at: now,
    updated_at: now,
  }
  return upsertLocalViewing(viewing)
}

export function removeLocalViewing(id: number): void {
  writeAll(readAll().filter((item) => item.id !== id))
}

export function mergeViewingsWithLocal(
  remote: PropertyViewingDto[],
  status?: ViewingStatus
): PropertyViewingDto[] {
  const local = listLocalViewings(status)
  const remoteIds = new Set(remote.map((item) => item.id))
  const extras = local.filter((item) => !remoteIds.has(item.id))
  return [...remote, ...extras].sort((a, b) =>
    String(b.scheduled_at).localeCompare(String(a.scheduled_at))
  )
}

function toDay(value: string): string {
  return value.slice(0, 10)
}

/** Build calendar events from locally saved bookings (Schedule fallback). */
export function listLocalCalendarEvents(
  from?: string,
  to?: string
): CalendarViewingEvent[] {
  return listLocalViewings()
    .filter((viewing) => {
      const day = toDay(String(viewing.scheduled_at))
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
    .map((viewing) => {
      const start = new Date(viewing.scheduled_at)
      const end = new Date(start.getTime() + (viewing.duration_minutes || 60) * 60_000)
      return {
        id: viewing.id,
        property_id: viewing.property_id,
        property: viewing.property,
        user: viewing.user,
        agent: viewing.agent,
        scheduled_at: viewing.scheduled_at,
        end_at: end.toISOString(),
        viewing_type: viewing.viewing_type,
        status: viewing.status,
      } satisfies CalendarViewingEvent
    })
}
