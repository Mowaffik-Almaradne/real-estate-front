export const RentalCardStatus = {
  active: "active",
  ended: "ended",
  cancelled: "cancelled",
  renewed: "renewed",
} as const
export type RentalCardStatus = (typeof RentalCardStatus)[keyof typeof RentalCardStatus]

export const TENANT_KIND = {
  registered: "registered",
  external: "external",
} as const
export type TenantKind = (typeof TENANT_KIND)[keyof typeof TENANT_KIND]

export const RENTAL_CARD_SORT_COLUMNS = [
  "created_at",
  "start_date",
  "end_date",
] as const
export type RentalCardSortColumn = (typeof RENTAL_CARD_SORT_COLUMNS)[number]

export const RENTAL_CARD_SORT_ORDERS = ["asc", "desc"] as const
export type RentalCardSortOrder = (typeof RENTAL_CARD_SORT_ORDERS)[number]

export function isActiveRentalCardStatus(
  status: RentalCardStatus | string
): boolean {
  return status === RentalCardStatus.active
}

export function canEndRentalCard(status: RentalCardStatus | string): boolean {
  return status === RentalCardStatus.active
}

export function canRenewRentalCard(
  status: RentalCardStatus | string,
  isRenewable: boolean | undefined
): boolean {
  return Boolean(isRenewable) && status === RentalCardStatus.active
}

export function canDeleteRentalCard(status: RentalCardStatus | string): boolean {
  return status !== RentalCardStatus.active
}

export function canEditRentalCard(
  status: RentalCardStatus | string
): boolean {
  if (status === RentalCardStatus.cancelled) return false
  return true
}

export function canCreateRenewal(
  status: RentalCardStatus | string,
  isRenewable: boolean | undefined
): boolean {
  return Boolean(isRenewable) && status === RentalCardStatus.active
}

export const RENTAL_CARD_TERMS_MAX = 5000
export const RENTAL_CARD_NOTES_MAX = 5000
export const RENTAL_CARD_END_REASON_MAX = 1000
export const RENTAL_CARD_EXTERNAL_TENANT_NAME_MAX = 255
export const RENTAL_CARD_EXTERNAL_TENANT_PHONE_MAX = 32
export const RENTAL_CARD_EXTERNAL_TENANT_EMAIL_MAX = 255
export const RENTAL_CARD_EXTERNAL_TENANT_NOTES_MAX = 1000
export const RENTAL_CARD_SEARCH_MAX = 100
export const RENTAL_CARD_PHOTOS_MAX = 20
export const RENTAL_CARD_PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const RENTAL_CARD_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"] as const
