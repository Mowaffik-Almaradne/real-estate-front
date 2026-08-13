"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Eye,
  Loader2,
  Pencil,
  Send,
  Trash2,
  Undo2,
  Wallet,
  X,
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

import { formatCurrency, formatDate, statusTone } from "@/lib/format"
import { ApiClientError } from "@/lib/apiClient"

import {
  canCancelDeposit,
  canDeleteDeposit,
  canPayDeposit,
  canRefundDeposit,
  canReleaseDeposit,
  canUpdateDeposit,
  DepositStatus,
} from "../types/enums"
import { depositService } from "../services/depositService"
import { depositStatusLabel, getDepositLabel, paymentMethodLabel } from "../labels"
import type { DepositDto } from "../types/dto"
import type { DepositPerspective } from "../types/enums"
import { PayDepositDialog } from "./PayDepositDialog"
import { ReleaseDepositDialog } from "./ReleaseDepositDialog"
import { RefundDepositDialog } from "./RefundDepositDialog"
import { CancelDepositDialog } from "./CancelDepositDialog"
import { UpdateDepositDialog } from "./UpdateDepositDialog"
import { DepositDetailDialog } from "./DepositDetailDialog"

interface DepositListItemProps {
  deposit: DepositDto
  perspective: DepositPerspective
  onUpdated?: (deposit: DepositDto) => void
  onDeleted?: (id: number) => void
}

function amountString(deposit: DepositDto): string {
  const numeric =
    typeof deposit.amount === "number"
      ? deposit.amount
      : Number(deposit.amount)
  return formatCurrency(Number.isNaN(numeric) ? 0 : numeric, deposit.currency, "en")
}

function otherParty(deposit: DepositDto, perspective: DepositPerspective) {
  if (perspective === "buyer") return deposit.seller
  return deposit.buyer
}

export function DepositListItem({
  deposit,
  perspective,
  onUpdated,
  onDeleted,
}: DepositListItemProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)
  const [payOpen, setPayOpen] = useState(false)
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const tone = statusTone(deposit.status)
  const badgeVariant =
    tone === "destructive"
      ? "destructive"
      : tone === "muted"
        ? "secondary"
        : tone === "info"
          ? "outline"
          : "default"

  const onDelete = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(label("deposits.actions.confirmDelete"))
      if (!confirmed) return
    }
    setBusy(true)
    try {
      await depositService.remove(deposit.id)
      toast.success(label("deposits.toast.deleted"))
      onDeleted?.(deposit.id)
    } catch (error) {
      const message =
        error instanceof ApiClientError &&
        error.isServerError() &&
        error.message.toLowerCase().includes("delete")
          ? label("deposits.errors.deleteNotAllowed")
          : error instanceof ApiClientError
            ? error.message
            : label("deposits.toast.deleteFailed")
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  const party = otherParty(deposit, perspective)
  const partyLabel = perspective === "buyer" ? label("deposits.fields.seller") : label("deposits.fields.buyer")
  const propertyTitle =
    deposit.property?.name ?? `Property #${deposit.property_id}`

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="font-semibold">{propertyTitle}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{amountString(deposit)}</span>
                {party && (
                  <span>
                    {partyLabel}: {party.name ?? `#${party.id}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  {formatDate(deposit.created_at, locale)}
                </span>
                {deposit.payment_method && (
                  <span className="flex items-center gap-1">
                    <Wallet className="size-3.5" />
                    {paymentMethodLabel(locale, deposit.payment_method)}
                  </span>
                )}
              </div>
              {deposit.cancellation_reason && (
                <p className="text-xs text-destructive">
                  {label("deposits.fields.cancellationReason")}: {deposit.cancellation_reason}
                </p>
              )}
            </div>
            <Badge variant={badgeVariant}>
              {depositStatusLabel(locale, deposit.status)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="size-3.5 mr-1" />
              {label("deposits.actions.view")}
            </Button>
            {canUpdateDeposit(deposit.status) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setUpdateOpen(true)}
              >
                <Pencil className="size-3.5 mr-1" />
                {label("deposits.actions.update")}
              </Button>
            )}
            {canPayDeposit(deposit.status) && perspective === "buyer" && (
              <Button type="button" size="sm" onClick={() => setPayOpen(true)}>
                <Send className="size-3.5 mr-1" />
                {label("deposits.actions.pay")}
              </Button>
            )}
            {canReleaseDeposit(deposit.status) && perspective === "seller" && (
              <Button
                type="button"
                size="sm"
                onClick={() => setReleaseOpen(true)}
              >
                <Send className="size-3.5 mr-1" />
                {label("deposits.actions.release")}
              </Button>
            )}
            {canRefundDeposit(deposit.status) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setRefundOpen(true)}
              >
                <Undo2 className="size-3.5 mr-1" />
                {label("deposits.actions.refund")}
              </Button>
            )}
            {canCancelDeposit(deposit.status) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCancelOpen(true)}
              >
                <X className="size-3.5 mr-1" />
                {label("deposits.actions.cancel")}
              </Button>
            )}
            {canDeleteDeposit(deposit.status) && (
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
                    {label("deposits.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <PayDepositDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        deposit={deposit}
        onPaid={(updated) => onUpdated?.(updated)}
      />
      <ReleaseDepositDialog
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        deposit={deposit}
        onReleased={(updated) => onUpdated?.(updated)}
      />
      <RefundDepositDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        deposit={deposit}
        onRefunded={(updated) => onUpdated?.(updated)}
      />
      <CancelDepositDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        deposit={deposit}
        onCancelled={(updated) => onUpdated?.(updated)}
      />
      <UpdateDepositDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        deposit={deposit}
        onUpdated={(updated) => onUpdated?.(updated)}
      />
      <DepositDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        deposit={deposit}
      />
    </>
  )
}

interface DepositListProps {
  deposits: DepositDto[]
  loading?: boolean
  error?: string | null
  perspective: DepositPerspective
  onUpdated?: (deposit: DepositDto) => void
  onDeleted?: (id: number) => void
}

export function DepositList({
  deposits,
  loading = false,
  error = null,
  perspective,
  onUpdated,
  onDeleted,
}: DepositListProps) {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getDepositLabel(locale, key, vars)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {label("deposits.list.loading")}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-destructive">
          <AlertCircle className="size-5 mx-auto mb-2" />
          {label("deposits.list.errorTitle")}
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          <CalendarIcon className="size-8 mx-auto mb-3 text-muted-foreground/60" />
          <p className="font-medium">{label("deposits.list.empty.title")}</p>
          <p className="text-xs mt-1">
            {perspective === "buyer"
              ? label("deposits.list.empty.description")
              : label("deposits.list.empty.seller.description")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {deposits.map((deposit) => (
        <DepositListItem
          key={deposit.id}
          deposit={deposit}
          perspective={perspective}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}

export { DepositStatus }
