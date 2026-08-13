export const APPOINTMENT_TYPES = ["viewing", "follow_up", "general"] as const
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number]

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
  "no_show",
] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const VIEWING_TYPES = ["in_person", "virtual", "open_house"] as const
export type ViewingType = (typeof VIEWING_TYPES)[number]

export const CONTACT_METHODS = ["call", "whatsapp", "visit", "email"] as const
export type ContactMethod = (typeof CONTACT_METHODS)[number]

export interface AppointmentUser {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
}

export interface AppointmentProperty {
  id: number
  name: string
  main_image?: string | null
  city?: { id: number; name: string } | null
  formatted_price?: string | null
}

export interface Appointment {
  id: number
  type: AppointmentType
  property_id: number | null
  property?: AppointmentProperty | null
  user_id: number
  user?: AppointmentUser | null
  agent_id?: number | null
  agent?: AppointmentUser | null
  scheduled_at: string
  end_at?: string | null
  duration_minutes: number
  buffer_minutes: number
  viewing_type?: ViewingType | null
  contact_method?: ContactMethod | null
  contact_name?: string | null
  contact_phone?: string | null
  notes?: string | null
  agent_notes?: string | null
  max_attendees: number
  status: AppointmentStatus
  cancellation_reason?: string | null
  cancelled_by?: number | null
  cancelled_at?: string | null
  followable_id?: number | null
  followable_type?: string | null
  created_at: string
  updated_at: string
}

export interface CreateAppointmentRequest {
  type?: AppointmentType
  property_id?: number | null
  scheduled_at: string
  duration_minutes?: number
  buffer_minutes?: number
  viewing_type?: ViewingType | null
  contact_method?: ContactMethod | null
  contact_name?: string | null
  contact_phone?: string | null
  notes?: string | null
  max_attendees?: number
  followable_id?: number
  followable_type?: string
}

export interface CreateFollowUpRequest {
  followable_id: number
  followable_type: string
  agent_id: number
  scheduled_at: string
  contact_method?: ContactMethod | null
  duration_minutes?: number
  buffer_minutes?: number
  notes?: string | null
  contact_name?: string | null
  contact_phone?: string | null
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus
  cancellation_reason?: string | null
  agent_notes?: string | null
  scheduled_at?: string
}

export interface AppointmentFilters {
  status?: AppointmentStatus
  type?: AppointmentType
  from?: string
  to?: string
  page?: number
  perPage?: number
}

export interface AppointmentsResponse {
  data: Appointment[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface AppointmentCalendarEvent {
  id: number
  type: AppointmentType
  property_id: number | null
  property?: AppointmentProperty | null
  agent_id?: number | null
  agent?: AppointmentUser | null
  user_id?: number | null
  user?: AppointmentUser | null
  scheduled_at: string
  end_at: string
  status: AppointmentStatus
  viewing_type?: ViewingType | null
  contact_method?: ContactMethod | null
}
