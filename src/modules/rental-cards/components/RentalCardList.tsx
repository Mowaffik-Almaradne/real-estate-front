"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  StopCircle,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { formatDate, statusTone } from "@/lib/format"
import { ApiClientError } from "@/lib/apiClient"

import {
  canDeleteRentalCard,
  canEditRentalCard,
  canEndRentalCard,
  canRenewRentalCard,
  RentalCardStatus,
} from "../types/enums"
import { rentalCardService } from "../services/rentalCardService"
import { getRentalCardLabel, rentalCardStatusLabel } from "../labels"
import type { RentalCardDto } from "../types/dto"
import {
  EndRentalCardDialog,
} from "./EndRentalCardDialog"
import {
  RenewRentalCardDialog,
} from "./RenewRentalCardDialog"
import {
  UpdateRentalCardDialog,
} from "./UpdateRentalCardDialog"
import {
  RentalCardDetailDialog,
} from "./RentalCardDetailDialog"

interface RentalCardListItemProps {
  card: RentalCardDto
  onUpdated?: (card: RentalCardDto) => void
  onDeleted?: (id: number) => void
}

function tenantDescription(card: RentalCardDto): string {
  if (card.tenant?.registered?.name) return card.tenant.registered.name
  if (card.tenant?.external_name) return card.tenant.external_name
  if (card.tenant_user_id) return `User #${card.tenant_user_id}`
  return "—"
}

function tenantSubtitle(card: RentalCardDto): string {
  if (card.tenant?.registered?.email) return card.tenant.registered.email
  if (card.tenant?.external_phone) return card.tenant.external_phone
  if (card.tenant?.external_email) return card.tenant.external_email
  if (card.tenant_user_id) return `ID: ${card.tenant_user_id}`
  return ""
}

export function RentalCardListItem({
  card,
  onUpdated,
  onDeleted,
}: RentalCardListItemProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)
  const [endOpen, setEndOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const onDelete = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(label("rentalCards.actions.confirmDelete"))
      if (!confirmed) return
    }
    setBusy(true)
    try {
      await rentalCardService.remove(card.id)
      toast.success(label("rentalCards.toast.deleted"))
      onDeleted?.(card.id)
    } catch (error) {
      const message =
        error instanceof ApiClientError &&
        error.isServerError() &&
        error.message.toLowerCase().includes("active")
          ? label("rentalCards.errors.deleteActive")
          : error instanceof ApiClientError
            ? error.message
            : label("rentalCards.toast.deleteFailed")
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  const statusLabel = rentalCardStatusLabel(locale, card.status)
  const tone = statusTone(card.status)
  const badgeVariant =
    tone === "destructive"
      ? "destructive"
      : tone === "muted"
        ? "secondary"
        : "default"

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              {card.property?.name ? (
                <p className="font-semibold">{card.property.name}</p>
              ) : (
                <p className="font-semibold">Property #{card.property_id}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <UserIcon className="size-3.5" />
                  {tenantDescription(card)}
                </span>
                {tenantSubtitle(card) && (
                  <span className="text-xs">{tenantSubtitle(card)}</span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  {formatDate(card.start_date, locale)} → {formatDate(card.end_date, locale)}
                </span>
                {card.is_renewable && (
                  <span className="text-xs">
                    {label("rentalCards.fields.renewalCount")}: {card.renewal_count ?? 0}
                  </span>
                )}
              </div>
              {card.end_reason && (
                <p className="text-xs text-destructive">
                  {label("rentalCards.fields.endReason")}: {card.end_reason}
                </p>
              )}
            </div>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="size-3.5 mr-1" />
              {label("rentalCards.actions.view")}
            </Button>
            {canEditRentalCard(card.status) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5 mr-1" />
                {label("rentalCards.actions.edit")}
              </Button>
            )}
            {canEndRentalCard(card.status) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEndOpen(true)}
              >
                <StopCircle className="size-3.5 mr-1" />
                {label("rentalCards.actions.end")}
              </Button>
            )}
            {canRenewRentalCard(card.status, card.is_renewable) && (
              <Button
                type="button"
                size="sm"
                onClick={() => setRenewOpen(true)}
              >
                <RefreshCw className="size-3.5 mr-1" />
                {label("rentalCards.actions.renew")}
              </Button>
            )}
            {canDeleteRentalCard(card.status) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm" variant="ghost" disabled={busy}>
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(event) => {
                      event.preventDefault()
                      void onDelete()
                    }}
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    {label("rentalCards.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <EndRentalCardDialog
        open={endOpen}
        onOpenChange={setEndOpen}
        card={card}
        onEnded={(updated) => onUpdated?.(updated)}
      />
      <RenewRentalCardDialog
        open={renewOpen}
        onOpenChange={setRenewOpen}
        card={card}
        onRenewed={(updated) => onUpdated?.(updated)}
      />
      <UpdateRentalCardDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        card={card}
        onUpdated={(updated) => onUpdated?.(updated)}
      />
      <RentalCardDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        card={card}
      />
    </>
  )
}

interface RentalCardListProps {
  cards: RentalCardDto[]
  loading?: boolean
  error?: string | null
  onUpdated?: (card: RentalCardDto) => void
  onDeleted?: (id: number) => void
}

export function RentalCardList({
  cards,
  loading = false,
  error = null,
  onUpdated,
  onDeleted,
}: RentalCardListProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getRentalCardLabel(locale, key, vars)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {label("rentalCards.list.loading")}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-destructive">
          <AlertCircle className="size-5 mx-auto mb-2" />
          {label("rentalCards.list.errorTitle")}
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          <CalendarIcon className="size-8 mx-auto mb-3 text-muted-foreground/60" />
          <p className="font-medium">{label("rentalCards.list.empty.title")}</p>
          <p className="text-xs mt-1">{label("rentalCards.list.empty.description")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <RentalCardListItem
          key={card.id}
          card={card}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}

export { RentalCardStatus }
