export const DepositStatus = {
  pending: "pending",
  held: "held",
  released: "released",
  refunded: "refunded",
  disputed: "disputed",
  cancelled: "cancelled",
} as const
export type DepositStatus = (typeof DepositStatus)[keyof typeof DepositStatus]

export const DEPOSIT_TERMINAL_STATUSES = [
  DepositStatus.released,
  DepositStatus.refunded,
  DepositStatus.cancelled,
] as const

export const DepositCurrency = {
  SAR: "SAR",
  USD: "USD",
} as const
export type DepositCurrency = (typeof DepositCurrency)[keyof typeof DepositCurrency]

export const DEPOSIT_CURRENCIES: readonly DepositCurrency[] = [
  DepositCurrency.SAR,
  DepositCurrency.USD,
] as const

export const PaymentMethod = {
  balance: "balance",
  stripe: "stripe",
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  PaymentMethod.balance,
  PaymentMethod.stripe,
] as const

export const DEPOSIT_SORT_COLUMNS = ["created_at", "amount", "status"] as const
export type DepositSortColumn = (typeof DEPOSIT_SORT_COLUMNS)[number]

export const DEPOSIT_SORT_ORDERS = ["asc", "desc"] as const
export type DepositSortOrder = (typeof DEPOSIT_SORT_ORDERS)[number]

export const DEPOSIT_PERSPECTIVE = {
  buyer: "buyer",
  seller: "seller",
} as const
export type DepositPerspective = (typeof DEPOSIT_PERSPECTIVE)[keyof typeof DEPOSIT_PERSPECTIVE]

export function isTerminalDepositStatus(status: DepositStatus | string): boolean {
  return (DEPOSIT_TERMINAL_STATUSES as readonly string[]).includes(status)
}

export function isPendingDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.pending
}

export function isHeldDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.held
}

export function isDisputedDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.disputed
}

export function canPayDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.pending
}

export function canCancelDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.pending || status === DepositStatus.disputed
}

export function canReleaseDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.held || status === DepositStatus.disputed
}

export function canRefundDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.held || status === DepositStatus.disputed
}

export function canUpdateDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.pending
}

export function canDeleteDeposit(status: DepositStatus | string): boolean {
  return (
    status !== DepositStatus.held &&
    status !== DepositStatus.disputed &&
    status !== DepositStatus.released
  )
}

export function canDisputeDeposit(status: DepositStatus | string): boolean {
  return status === DepositStatus.held
}

export const DEPOSIT_AMOUNT_MIN = 0.01
export const DEPOSIT_TERMS_MAX = 5000
export const DEPOSIT_NOTES_MAX = 5000
export const DEPOSIT_CANCEL_REASON_MAX = 1000
export const DEPOSIT_RELEASE_NOTES_MAX = 1000
export const DEPOSIT_REFUND_NOTES_MAX = 1000
