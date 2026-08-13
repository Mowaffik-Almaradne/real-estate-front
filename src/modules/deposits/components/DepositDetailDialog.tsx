"use client"

import { useLocale } from "next-intl"
import {
  Calendar as CalendarIcon,
  Coins,
  User as UserIcon,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  statusTone,
} from "@/lib/format"

import {
  depositStatusLabel,
  getDepositLabel,
  paymentMethodLabel,
} from "../labels"
import type { DepositDto } from "../types/dto"

interface DepositDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositDto | null
}

export function DepositDetailDialog({
  open,
  onOpenChange,
  deposit,
}: DepositDetailDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)

  if (!deposit) return null
  const tone = statusTone(deposit.status)
  const badgeVariant =
    tone === "destructive"
      ? "destructive"
      : tone === "muted"
        ? "secondary"
        : tone === "info"
          ? "outline"
          : "default"

  const amount =
    typeof deposit.amount === "number"
      ? deposit.amount
      : Number(deposit.amount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {deposit.property?.name ?? `Property #${deposit.property_id}`}
            <Badge variant={badgeVariant}>
              {depositStatusLabel(locale, deposit.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {label("deposits.fields.createdAt")}: {formatDateTime(deposit.created_at, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Coins className="size-3" />
                {label("deposits.fields.amount")}
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(Number.isNaN(amount) ? 0 : amount, deposit.currency, locale)}
              </div>
              {deposit.payment_method && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wallet className="size-3" />
                  {paymentMethodLabel(locale, deposit.payment_method)}
                </div>
              )}
            </div>
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="size-3" />
                {label("deposits.fields.buyer")} / {label("deposits.fields.seller")}
              </div>
              {deposit.buyer && (
                <div className="text-xs">
                  <span className="text-muted-foreground">{label("deposits.fields.buyer")}:</span>{" "}
                  {deposit.buyer.name ?? `#${deposit.buyer.id}`}
                </div>
              )}
              {deposit.seller && (
                <div className="text-xs">
                  <span className="text-muted-foreground">{label("deposits.fields.seller")}:</span>{" "}
                  {deposit.seller.name ?? `#${deposit.seller.id}`}
                </div>
              )}
            </div>
          </div>

          <Timeline deposit={deposit} />

          {deposit.cancellation_reason && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive text-xs">
              <strong>{label("deposits.fields.cancellationReason")}:</strong>{" "}
              {deposit.cancellation_reason}
            </div>
          )}

          {deposit.terms && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("deposits.fields.terms")}
              </div>
              <p className="whitespace-pre-wrap">{deposit.terms}</p>
            </div>
          )}

          {deposit.notes && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("deposits.fields.notes")}
              </div>
              <p className="whitespace-pre-wrap">{deposit.notes}</p>
            </div>
          )}

          {deposit.release_notes && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("deposits.fields.releaseNotes")}
              </div>
              <p className="whitespace-pre-wrap">{deposit.release_notes}</p>
            </div>
          )}

          {deposit.refund_notes && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("deposits.fields.refundNotes")}
              </div>
              <p className="whitespace-pre-wrap">{deposit.refund_notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TimelineEntry {
  icon: typeof CalendarIcon
  labelKey: string
  at?: string | null
}

function Timeline({ deposit }: { deposit: DepositDto }) {
  const locale = useLocale()
  const label = (key: string) => getDepositLabel(locale, key)
  const entries: TimelineEntry[] = [
    { icon: CalendarIcon, labelKey: "deposits.fields.createdAt", at: deposit.created_at },
    { icon: Wallet, labelKey: "deposits.fields.heldAt", at: deposit.held_at },
    { icon: CalendarIcon, labelKey: "deposits.fields.releasedAt", at: deposit.released_at },
    { icon: CalendarIcon, labelKey: "deposits.fields.refundedAt", at: deposit.refunded_at },
    { icon: CalendarIcon, labelKey: "deposits.fields.disputedAt", at: deposit.disputed_at },
    { icon: CalendarIcon, labelKey: "deposits.fields.cancelledAt", at: deposit.cancelled_at },
  ].filter((entry) => Boolean(entry.at))

  if (entries.length === 0) return null

  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground mb-2">Timeline</div>
      <ul className="space-y-1 text-xs">
        {entries.map((entry, idx) => (
          <li key={`${entry.labelKey}-${idx}`} className="flex items-center gap-2">
            <entry.icon className="size-3 text-muted-foreground" />
            <span className="font-medium">{label(entry.labelKey)}:</span>
            <span className="text-muted-foreground">
              {formatDate(entry.at, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
