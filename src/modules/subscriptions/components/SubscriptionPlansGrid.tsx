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
import type { ApiPagination } from "@/types/common"
import type { SubscriptionPlan } from "../types"
import { useSubscriptionsTranslations } from "../locales/useSubscriptionsTranslations"

export type PlansPaginationInfo = ApiPagination

interface SubscriptionPlansGridProps {
  plans: SubscriptionPlan[]
  loading: boolean
  pagination: ApiPagination
  emptyMessage: string
  onEdit: (plan: SubscriptionPlan) => void
  onDelete: (plan: SubscriptionPlan) => void
}

export function SubscriptionPlansGrid({
  plans,
  loading,
  emptyMessage,
  onEdit,
  onDelete,
}: SubscriptionPlansGridProps) {
  const { t } = useSubscriptionsTranslations()
  const rows = useMemo(() => plans, [plans])

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
            <TableHead>{t("plans.columns.name")}</TableHead>
            <TableHead>{t("plans.columns.price")}</TableHead>
            <TableHead>{t("plans.columns.duration")}</TableHead>
            <TableHead>{t("plans.columns.features")}</TableHead>
            <TableHead>{t("plans.columns.active")}</TableHead>
            <TableHead className="w-[1%] text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((plan) => {
            const featureCount =
              plan.feature_details?.length ??
              plan.features?.length ??
              0
            return (
              <TableRow key={plan.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {plan.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {plan.currency ?? ""}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {plan.duration_days} d
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {featureCount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {plan.is_active
                      ? t("plans.status.active")
                      : t("plans.status.inactive")}
                  </span>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => onEdit(plan)}
                    >
                      {t("plans.editPlan")}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-destructive hover:underline"
                      onClick={() => onDelete(plan)}
                    >
                      {t("plans.delete.confirm")}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
