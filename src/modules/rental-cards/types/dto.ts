import type { ApiPagination, Timestamps } from "@/types/common"
import type {
  RentalCardStatus,
  TenantKind,
  RentalCardSortColumn,
  RentalCardSortOrder,
} from "./enums"

export interface RentalCardRegisteredTenant {
  id: number
  name: string
  email?: string | null
  phone?: string | null
}

export interface RentalCardTenant {
  type: TenantKind
  registered?: RentalCardRegisteredTenant | null
  external_name?: string | null
  external_phone?: string | null
  external_email?: string | null
  external_id_notes?: string | null
}

export interface RentalCardPropertySummary {
  id: number
  name?: string | null
  main_image?: string | null
  status?: string | null
}

export interface RentalCardDto extends Timestamps {
  id: number
  property_id: number
  owner_id?: number | null
  tenant_user_id?: number | null
  status: RentalCardStatus
  start_date: string
  end_date: string
  ended_at?: string | null
  ended_by?: number | null
  end_reason?: string | null
  terms?: string | null
  notes?: string | null
  is_renewable: boolean
  renewal_count?: number
  tenant?: RentalCardTenant | null
  property?: RentalCardPropertySummary | null
  pre_rental_photos?: string[]
}

export interface RentalCardListResponse {
  data: RentalCardDto[]
  pagination: ApiPagination
}

export interface RentalCardActiveResponse {
  data: RentalCardDto | null
  message?: string | null
}

export interface RentalCardHistoryResponse {
  data: RentalCardDto[]
  pagination: ApiPagination
}

export interface RentalCardFilters {
  search?: string
  status?: RentalCardStatus
  property_id?: number
  owner_id?: number
  tenant_user_id?: number
  is_renewable?: boolean
  start_date?: string
  end_date?: string
  sort_by?: RentalCardSortColumn
  sort_order?: RentalCardSortOrder
  page?: number
  perPage?: number
}

export interface CreateRentalCardInput {
  property_id: number
  tenant_user_id?: number | null
  external_tenant_name?: string | null
  external_tenant_phone?: string | null
  external_tenant_email?: string | null
  external_tenant_id_notes?: string | null
  start_date: string
  end_date: string
  terms?: string | null
  notes?: string | null
  is_renewable?: boolean | null
  pre_rental_photos?: File[] | null
}

export interface UpdateRentalCardInput {
  end_date?: string
  terms?: string | null
  notes?: string | null
  is_renewable?: boolean | null
}

export interface EndRentalCardInput {
  ended_at?: string | null
  end_reason?: string | null
}

export interface RenewRentalCardInput {
  end_date: string
  terms?: string | null
  notes?: string | null
}

export interface RentalCardPhotoUpload {
  file: File
  previewUrl?: string
}
