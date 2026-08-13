"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"

import { ApiClientError } from "@/lib/apiClient"

import {
  CouponsFiltersBar,
  CouponsTable,
  SubscriptionCouponFormDialog,
  SubscriptionDeleteDialog,
  useCoupons,
  useSubscriptionsTranslations,
  type SubscriptionDiscount,
} from "src/modules/subscriptions"

export default function SubscriptionCouponsPage() {
  const { t } = useSubscriptionsTranslations()
  const couponsHook = useCoupons()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionDiscount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionDiscount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await couponsHook.remove(deleteTarget.id)
      toast.success(t("coupons.delete.success"))
      setDeleteTarget(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.deleteFailed")
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("coupons.subtitle")}</p>
        <Button onClick={handleNew}>
          <Plus className="mr-1.5 size-4" />
          {t("coupons.newCoupon")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <CouponsFiltersBar
            filters={couponsHook.filters}
            onChange={couponsHook.setFilters}
            loading={couponsHook.loading}
          />
          <CouponsTable
            coupons={couponsHook.coupons}
            loading={couponsHook.loading}
            emptyMessage={t("coupons.empty")}
            onEdit={(coupon) => {
              setEditing(coupon)
              setFormOpen(true)
            }}
            onDelete={(coupon) => setDeleteTarget(coupon)}
          />
        </CardContent>
      </Card>

      <SubscriptionCouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => setEditing(null)}
      />

      <SubscriptionDeleteDialog
        open={Boolean(deleteTarget)}
        submitting={deleting}
        titleKey="coupons.delete.title"
        descriptionKey="coupons.delete.description"
        confirmKey="coupons.delete.confirm"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
