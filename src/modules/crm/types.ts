export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_SOURCES = [
  "website",
  "whatsapp",
  "referral",
  "walk_in",
  "phone",
  "other",
] as const

export type LeadSource = (typeof LEAD_SOURCES)[number]

export interface LeadUser {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
}

export interface LeadNote {
  id: number
  lead_id: number
  body: string
  author_id?: number | null
  author?: LeadUser | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: number
  name: string
  phone: string
  email: string | null
  source: LeadSource
  status: LeadStatus
  lost_reason: string | null
  trader_id?: number | null
  assigned_to?: number | null
  archived_at: string | null
  notes?: readonly LeadNote[]
  notes_count?: number
  follow_ups_count?: number
  last_contacted_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreateLeadRequest {
  name: string
  phone: string
  email?: string | null
  source: LeadSource
  status?: LeadStatus
}

export interface UpdateLeadRequest {
  name?: string
  phone?: string
  email?: string | null
  source?: LeadSource
}

export interface UpdateLeadStatusRequest {
  status: LeadStatus
  lost_reason?: string | null
}

export interface LeadDuplicateMatch {
  id: number
  name: string
  phone: string
  email: string | null
  status: LeadStatus
  matched_on: "phone" | "email"
}

export interface LeadDuplicateResult {
  duplicate: boolean
  match: LeadDuplicateMatch | null
}

export interface CreateLeadNoteRequest {
  body: string
}

export interface UpdateLeadNoteRequest {
  body?: string
}

export interface LeadFilters {
  status?: LeadStatus
  source?: LeadSource
  search?: string
  page?: number
  perPage?: number
}

export interface LeadsResponse {
  data: Lead[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface CrmDashboardSummary {
  total_leads: number
  new_leads: number
  contacted_leads: number
  qualified_leads: number
  won_leads: number
  lost_leads: number
  conversion_rate: number
  leads_change: number
  won_change: number
  archived_leads?: number
}

export interface CrmTodaySnapshot {
  today_leads: number
  new_today: number
  contacted_today: number
  qualified_today: number
  follow_ups_due: number
  upcoming_appointments: number
}
