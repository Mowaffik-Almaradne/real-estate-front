


const DEFAULT_LOCALE = "en-US"
const DEFAULT_CURRENCY = "USD"

const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>()
const currencyFormatters = new Map<string, Intl.NumberFormat>()
const numberFormatters = new Map<string, Intl.NumberFormat>()

function getDateFormatter(locale: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" })
    dateFormatters.set(locale, formatter)
  }
  return formatter
}

function getDateTimeFormatter(locale: string): Intl.DateTimeFormat {
  let formatter = dateTimeFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    dateTimeFormatters.set(locale, formatter)
  }
  return formatter
}

function getCurrencyFormatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}::${currency}`
  let formatter = currencyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency })
    currencyFormatters.set(key, formatter)
  }
  return formatter
}

function getNumberFormatter(locale: string): Intl.NumberFormat {
  let formatter = numberFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    numberFormatters.set(locale, formatter)
  }
  return formatter
}

function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  value: string | number | Date | null | undefined,
  locale: string = DEFAULT_LOCALE
): string {
  const date = parseDate(value)
  if (!date) return "—"
  return getDateFormatter(locale).format(date)
}

export function formatDateTime(
  value: string | number | Date | null | undefined,
  locale: string = DEFAULT_LOCALE
): string {
  const date = parseDate(value)
  if (!date) return "—"
  return getDateTimeFormatter(locale).format(date)
}

export function formatRelative(
  value: string | number | Date | null | undefined,
  locale: string = DEFAULT_LOCALE
): string {
  const date = parseDate(value)
  if (!date) return "—"
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSec = Math.round(diffMs / 1000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const abs = Math.abs(diffSec)
  if (abs < 60) return formatter.format(diffSec, "second")
  if (abs < 3600) return formatter.format(Math.round(diffSec / 60), "minute")
  if (abs < 86_400) return formatter.format(Math.round(diffSec / 3600), "hour")
  if (abs < 604_800) return formatter.format(Math.round(diffSec / 86_400), "day")
  if (abs < 2_592_000) return formatter.format(Math.round(diffSec / 604_800), "week")
  if (abs < 31_536_000) return formatter.format(Math.round(diffSec / 2_592_000), "month")
  return formatter.format(Math.round(diffSec / 31_536_000), "year")
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  if (amount === null || amount === undefined || amount === "") return "—"
  const value = typeof amount === "string" ? Number(amount) : amount
  if (Number.isNaN(value)) return "—"
  return getCurrencyFormatter(locale, currency).format(value)
}

export function formatNumber(
  value: number | string | null | undefined,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || value === "") return "—"
  const parsed = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(parsed)) return "—"
  if (options) {
    return new Intl.NumberFormat(locale, options).format(parsed)
  }
  return getNumberFormatter(locale).format(parsed)
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return ""
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending Review",
  under_inspection: "Under Inspection",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  sold: "Sold",
  archived: "Archived",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No Show",
  active: "Active",
  inactive: "Inactive",
  paused: "Paused",
  individual: "Individual",
  office: "Office",
  chat: "Internal Chat",
  external: "External Contact",
  expired: "Expired",
  accepted: "Accepted",
  in_progress: "In Progress",
  photographer: "Photographer",
  lawyer: "Lawyer",
  inspector: "Inspector",
  marketer: "Marketer",
  posted: "Posted",
  reversed: "Reversed",
  paid: "Paid",
  failed: "Failed",
}

const STATUS_TONES: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "muted"> = {
  draft: "muted",
  pending: "warning",
  under_inspection: "info",
  approved: "success",
  rejected: "destructive",
  suspended: "warning",
  sold: "info",
  archived: "muted",
  confirmed: "success",
  rescheduled: "info",
  cancelled: "muted",
  completed: "success",
  no_show: "destructive",
  active: "success",
  inactive: "muted",
  paused: "warning",
  expired: "destructive",
  accepted: "info",
  in_progress: "info",
  posted: "success",
  reversed: "warning",
  paid: "success",
  failed: "destructive",
}

export function statusLabel(
  status: string | null | undefined,
  translator?: (key: string) => string
): string {
  if (!status) return ""
  if (translator) {
    try {
      const translated = translator(status)
      if (translated && translated !== status) return translated
    } catch {
      // fall through to default
    }
  }
  return STATUS_LABELS[status] ?? titleCase(status)
}

export function statusTone(
  status: string | null | undefined
): "default" | "success" | "warning" | "destructive" | "info" | "muted" {
  if (!status) return "default"
  return STATUS_TONES[status] ?? "default"
}
