"use client"

import { useLocale } from "next-intl"
import {
  Calendar as CalendarIcon,
  Image as ImageIcon,
  User as UserIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { formatDate, formatDateTime, statusTone } from "@/lib/format"

import { getRentalCardLabel, rentalCardStatusLabel } from "../labels"
import type { RentalCardDto } from "../types/dto"

interface RentalCardDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: RentalCardDto | null
}

function tenantName(card: RentalCardDto): string {
  return (
    card.tenant?.registered?.name ??
    card.tenant?.external_name ??
    (card.tenant_user_id ? `User #${card.tenant_user_id}` : "—")
  )
}

export function RentalCardDetailDialog({
  open,
  onOpenChange,
  card,
}: RentalCardDetailDialogProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)

  if (!card) return null
  const tone = statusTone(card.status)
  const badgeVariant =
    tone === "destructive"
      ? "destructive"
      : tone === "muted"
        ? "secondary"
        : "default"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {card.property?.name ?? `Property #${card.property_id}`}
            <Badge variant={badgeVariant}>
              {rentalCardStatusLabel(locale, card.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Created {formatDateTime(card.created_at, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="size-3" />
                {label("rentalCards.fields.tenant")}
              </div>
              <div className="font-medium">{tenantName(card)}</div>
              {card.tenant?.registered?.email && (
                <div className="text-xs text-muted-foreground">
                  {card.tenant.registered.email}
                </div>
              )}
              {card.tenant?.external_phone && (
                <div className="text-xs text-muted-foreground">
                  {card.tenant.external_phone}
                </div>
              )}
              {card.tenant?.external_email && (
                <div className="text-xs text-muted-foreground">
                  {card.tenant.external_email}
                </div>
              )}
              {card.tenant?.external_id_notes && (
                <div className="text-xs text-muted-foreground mt-1">
                  {card.tenant.external_id_notes}
                </div>
              )}
            </div>
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {label("rentalCards.fields.startDate")} → {label("rentalCards.fields.endDate")}
              </div>
              <div className="font-medium">
                {formatDate(card.start_date, locale)} → {formatDate(card.end_date, locale)}
              </div>
              {card.ended_at && (
                <div className="text-xs text-muted-foreground">
                  {label("rentalCards.fields.endedAt")}: {formatDate(card.ended_at, locale)}
                </div>
              )}
              {card.is_renewable && (
                <div className="text-xs text-muted-foreground">
                  {label("rentalCards.fields.renewalCount")}: {card.renewal_count ?? 0}
                </div>
              )}
            </div>
          </div>

          {card.end_reason && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive text-xs">
              <strong>{label("rentalCards.fields.endReason")}:</strong> {card.end_reason}
            </div>
          )}

          {card.terms && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("rentalCards.fields.terms")}
              </div>
              <p className="whitespace-pre-wrap">{card.terms}</p>
            </div>
          )}

          {card.notes && (
            <div className="rounded-md border p-3 space-y-1">
              <div className="text-xs text-muted-foreground">
                {label("rentalCards.fields.notes")}
              </div>
              <p className="whitespace-pre-wrap">{card.notes}</p>
            </div>
          )}

          {card.pre_rental_photos && card.pre_rental_photos.length > 0 && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ImageIcon className="size-3" />
                {label("rentalCards.fields.preRentalPhotos")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {card.pre_rental_photos.map((src) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="Pre-rental"
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
