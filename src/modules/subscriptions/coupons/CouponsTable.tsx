"use client"

import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table"
import { Skeleton } from "components/ui/skeleton"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import type {
  SubscriptionDiscount,
  SubscriptionDiscountFilters,
} from "./types"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

interface CouponsTableProps {
  coupons: SubscriptionDiscount[]
  loading: boolean
  togglingId?: number | null
  emptyMessage: string
  onEdit: (coupon: SubscriptionDiscount) => void
  onToggle?: (coupon: SubscriptionDiscount) => void
  onDelete: (coupon: SubscriptionDiscount) => void
}

export function CouponsTable({
  coupons,
  loading,
  togglingId = null,
  emptyMessage,
  onEdit,
  onToggle,
  onDelete,
}: CouponsTableProps) {
  const { t } = useSubscriptionsTranslations()
  const rows = useMemo(() => coupons, [coupons])

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("coupons.columns.code")}</TableHead>
            <TableHead>{t("coupons.columns.type")}</TableHead>
            <TableHead>{t("coupons.columns.value")}</TableHead>
            <TableHead>{t("coupons.columns.maxUses")}</TableHead>
            <TableHead>{t("coupons.columns.expiresAt")}</TableHead>
            <TableHead>{t("coupons.columns.active")}</TableHead>
            <TableHead className="w-[1%] text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell className="text-sm">
                {coupon.type === "percentage"
                  ? t("coupons.form.typePercentage")
                  : t("coupons.form.typeFixed")}
              </TableCell>
              <TableCell className="text-sm">
                {coupon.type === "percentage"
                  ? `${coupon.value}%`
                  : coupon.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {coupon.max_uses ?? "∞"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {coupon.expires_at
                  ? new Date(coupon.expires_at).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell className="text-sm">
                {onToggle ? (
                  <Switch
                    checked={coupon.is_active}
                    disabled={togglingId === coupon.id || loading}
                    onCheckedChange={() => onToggle(coupon)}
                    aria-label={
                      coupon.is_active
                        ? t("coupons.status.active")
                        : t("coupons.status.inactive")
                    }
                  />
                ) : coupon.is_active ? (
                  t("coupons.status.active")
                ) : (
                  t("coupons.status.inactive")
                )}
              </TableCell>
              <TableCell className="text-end">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => onEdit(coupon)}
                  >
                    {t("coupons.editCoupon")}
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-destructive hover:underline"
                    onClick={() => onDelete(coupon)}
                  >
                    {t("coupons.delete.confirm")}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface CouponsFiltersBarProps {
  filters: SubscriptionDiscountFilters
  onChange: (filters: SubscriptionDiscountFilters) => void
  loading?: boolean
}

export function CouponsFiltersBar({
  filters,
  onChange,
  loading,
}: CouponsFiltersBarProps) {
  const { t } = useSubscriptionsTranslations()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="coupons-search">
          {t("coupons.searchPlaceholder")}
        </Label>
        <Input
          id="coupons-search"
          placeholder={t("coupons.searchPlaceholder")}
          disabled={loading}
          value={filters.search ?? ""}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value || undefined })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coupons-type">{t("coupons.columns.type")}</Label>
        <select
          id="coupons-type"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={filters.type ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              type:
                event.target.value === ""
                  ? undefined
                  : (event.target.value as SubscriptionDiscountFilters["type"]),
            })
          }
        >
          <option value="">All</option>
          <option value="percentage">{t("coupons.form.typePercentage")}</option>
          <option value="fixed">{t("coupons.form.typeFixed")}</option>
        </select>
      </div>
    </div>
  )
}
