export const PropertyType = {
  apartment: "apartment",
  house: "house",
  villa: "villa",
  land: "land",
  commercial: "commercial",
  office: "office",
  warehouse: "warehouse",
  other: "other",
} as const
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType]

export const PropertyStatus = {
  draft: "draft",
  pending: "pending",
  under_inspection: "under_inspection",
  approved: "approved",
  rejected: "rejected",
  suspended: "suspended",
  sold: "sold",
  archived: "archived",
} as const
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus]

export const TypeOfContract = {
  sale: "sale",
  rent: "rent",
} as const
export type TypeOfContract = (typeof TypeOfContract)[keyof typeof TypeOfContract]

export const ViewingStatus = {
  pending: "pending",
  confirmed: "confirmed",
  rescheduled: "rescheduled",
  cancelled: "cancelled",
  completed: "completed",
  no_show: "no_show",
} as const
export type ViewingStatus = (typeof ViewingStatus)[keyof typeof ViewingStatus]

export const ViewingType = {
  in_person: "in_person",
  virtual: "virtual",
  open_house: "open_house",
} as const
export type ViewingType = (typeof ViewingType)[keyof typeof ViewingType]

export const AdStatus = {
  draft: "draft",
  active: "active",
  paused: "paused",
  archived: "archived",
} as const
export type AdStatus = (typeof AdStatus)[keyof typeof AdStatus]

export const AdType = {
  banner: "banner",
  sponsored: "sponsored",
} as const
export type AdType = (typeof AdType)[keyof typeof AdType]

export const AdMediaType = {
  video: "video",
  image: "image",
} as const
export type AdMediaType = (typeof AdMediaType)[keyof typeof AdMediaType]

export const PricingTier = {
  basic: "basic",
  standard: "standard",
  premium: "premium",
} as const
export type PricingTier = (typeof PricingTier)[keyof typeof PricingTier]

export const SponsorDuration = {
  days_7: "days_7",
  days_14: "days_14",
  days_30: "days_30",
} as const
export type SponsorDuration = (typeof SponsorDuration)[keyof typeof SponsorDuration]

export const UserStatus = {
  active: "active",
  inactive: "inactive",
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const PublisherType = {
  individual: "individual",
  office: "office",
} as const
export type PublisherType = (typeof PublisherType)[keyof typeof PublisherType]

export const ContactPreference = {
  chat: "chat",
  external: "external",
} as const
export type ContactPreference = (typeof ContactPreference)[keyof typeof ContactPreference]

export const ChatRoomType = {
  private: "private",
  group: "group",
} as const
export type ChatRoomType = (typeof ChatRoomType)[keyof typeof ChatRoomType]

export const MessageType = {
  text: "text",
  image: "image",
  file: "file",
} as const
export type MessageType = (typeof MessageType)[keyof typeof MessageType]

export const ConversationType = {
  property_inquiry: "property_inquiry",
  general: "general",
} as const
export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType]

export const DeviceType = {
  android: "android",
  ios: "ios",
  web: "web",
} as const
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

export const NotificationType = {
  new_message: "new_message",
  new_offer: "new_offer",
  property_update: "property_update",
  booking_confirmed: "booking_confirmed",
  admin_alert: "admin_alert",
  subscription_expiring: "subscription_expiring",
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const SubscriptionStatus = {
  pending: "pending",
  active: "active",
  expired: "expired",
  cancelled: "cancelled",
} as const
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]

export const FeatureType = {
  toggle: "toggle",
  limit: "limit",
} as const
export type FeatureType = (typeof FeatureType)[keyof typeof FeatureType]

export const DiscountType = {
  percentage: "percentage",
  fixed: "fixed",
} as const
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]

export const ServiceProviderType = {
  photographer: "photographer",
  lawyer: "lawyer",
  inspector: "inspector",
  marketer: "marketer",
  other: "other",
} as const
export type ServiceProviderType = (typeof ServiceProviderType)[keyof typeof ServiceProviderType]

export const ServiceRequestStatus = {
  pending: "pending",
  accepted: "accepted",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
  rejected: "rejected",
} as const
export type ServiceRequestStatus = (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus]

export const PricingType = {
  fixed: "fixed",
  hourly: "hourly",
  negotiable: "negotiable",
} as const
export type PricingType = (typeof PricingType)[keyof typeof PricingType]

export const ServiceType = {
  photography: "photography",
  inspection: "inspection",
  legal: "legal",
  marketing: "marketing",
} as const
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]

export const ServiceTaskType = {
  photo_upload: "photo_upload",
  checklist: "checklist",
  report: "report",
  verify: "verify",
} as const
export type ServiceTaskType = (typeof ServiceTaskType)[keyof typeof ServiceTaskType]

export const JournalEntryStatus = {
  draft: "draft",
  posted: "posted",
  reversed: "reversed",
} as const
export type JournalEntryStatus = (typeof JournalEntryStatus)[keyof typeof JournalEntryStatus]

export const AccountCategory = {
  asset: "asset",
  liability: "liability",
  equity: "equity",
  revenue: "revenue",
  expense: "expense",
} as const
export type AccountCategory = (typeof AccountCategory)[keyof typeof AccountCategory]

export const AccountType = {
  user_balance: "user_balance",
  revenue: "revenue",
  clearing: "clearing",
  platform_fee: "platform_fee",
  liability: "liability",
  expense: "expense",
} as const
export type AccountType = (typeof AccountType)[keyof typeof AccountType]

export const EntryType = {
  debit: "debit",
  credit: "credit",
} as const
export type EntryType = (typeof EntryType)[keyof typeof EntryType]

export const PayrollPaymentStatus = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
} as const
export type PayrollPaymentStatus = (typeof PayrollPaymentStatus)[keyof typeof PayrollPaymentStatus]

export const PayrollType = {
  monthly: "monthly",
  per_task: "per_task",
  both: "both",
} as const
export type PayrollType = (typeof PayrollType)[keyof typeof PayrollType]

export function canTransitionPropertyStatus(
  current: PropertyStatus,
  next: PropertyStatus
): boolean {
  const transitions: Record<PropertyStatus, readonly PropertyStatus[]> = {
    draft: [PropertyStatus.pending, PropertyStatus.archived],
    pending: [PropertyStatus.under_inspection, PropertyStatus.approved, PropertyStatus.rejected],
    under_inspection: [PropertyStatus.approved, PropertyStatus.rejected],
    approved: [PropertyStatus.suspended, PropertyStatus.sold, PropertyStatus.archived],
    rejected: [PropertyStatus.draft, PropertyStatus.archived],
    suspended: [PropertyStatus.approved, PropertyStatus.archived],
    sold: [PropertyStatus.archived],
    archived: [],
  }
  return transitions[current]?.includes(next) ?? false
}

export function canTransitionViewingStatus(
  current: ViewingStatus,
  next: ViewingStatus
): boolean {
  const transitions: Record<ViewingStatus, readonly ViewingStatus[]> = {
    pending: [ViewingStatus.confirmed, ViewingStatus.rescheduled, ViewingStatus.cancelled, ViewingStatus.no_show],
    confirmed: [ViewingStatus.rescheduled, ViewingStatus.cancelled, ViewingStatus.completed, ViewingStatus.no_show],
    rescheduled: [ViewingStatus.confirmed, ViewingStatus.cancelled, ViewingStatus.completed, ViewingStatus.no_show],
    completed: [],
    cancelled: [],
    no_show: [],
  }
  return transitions[current]?.includes(next) ?? false
}

export function canTransitionServiceRequestStatus(
  current: ServiceRequestStatus,
  next: ServiceRequestStatus
): boolean {
  const transitions: Record<ServiceRequestStatus, readonly ServiceRequestStatus[]> = {
    pending: [ServiceRequestStatus.accepted, ServiceRequestStatus.rejected, ServiceRequestStatus.cancelled],
    accepted: [ServiceRequestStatus.in_progress, ServiceRequestStatus.cancelled, ServiceRequestStatus.rejected],
    in_progress: [ServiceRequestStatus.completed, ServiceRequestStatus.cancelled],
    completed: [],
    cancelled: [],
    rejected: [],
  }
  return transitions[current]?.includes(next) ?? false
}
