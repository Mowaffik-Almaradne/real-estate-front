import type { ApiPagination, Timestamps } from "./common"
import { ViewingStatus, ViewingType } from "@/types/enums"

export interface ViewingParticipant {
  id: number
  name: string
  avatar_url?: string | null
  email?: string
  phone?: string | null
}

export interface ViewingProperty {
  id: number
  name: string
  main_image?: string | null
  city?: { id: number; name: string } | null
  formatted_price?: string
}

export interface PropertyViewingDto extends Timestamps {
  id: number
  property_id: number
  property?: ViewingProperty | null
  user_id: number
  user?: ViewingParticipant | null
  agent_id?: number | null
  agent?: ViewingParticipant | null
  scheduled_at: string
  duration_minutes: number
  buffer_minutes: number
  viewing_type: ViewingType
  status: ViewingStatus
  max_attendees: number
  contact_name?: string | null
  contact_phone?: string | null
  notes?: string | null
  cancellation_reason?: string | null
  cancelled_by?: number | null
  cancelled_at?: string | null
}

export interface CreateViewingRequest {
  property_id: number
  scheduled_at: string
  duration_minutes?: number
  buffer_minutes?: number
  viewing_type: ViewingType
  contact_name?: string
  contact_phone?: string
  notes?: string
  max_attendees?: number
}

export interface RescheduleViewingRequest {
  scheduled_at: string
  duration_minutes?: number
  buffer_minutes?: number
  notes?: string
}

export interface CancelViewingRequest {
  cancellation_reason?: string
}

export interface ViewingFilters {
  status?: ViewingStatus
  property_id?: number
  scheduled_at?: string
  from?: string
  to?: string
  page?: number
  perPage?: number
}

export interface ViewingsResponse {
  data: PropertyViewingDto[]
  pagination: ApiPagination
}

export interface CalendarViewingEvent {
  id: number
  property_id: number
  property?: ViewingProperty | null
  user?: ViewingParticipant | null
  agent?: ViewingParticipant | null
  scheduled_at: string
  end_at: string
  viewing_type: ViewingType
  status: ViewingStatus
}
