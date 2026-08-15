"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, RefreshCw } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Pagination } from "components/ui/pagination"

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
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSaved = async () => {
    setEditing(null)
    await couponsHook.refresh()
  }

  const handleToggle = async (coupon: SubscriptionDiscount) => {
    setTogglingId(coupon.id)
    try {
      await couponsHook.update(coupon.id, { is_active: !coupon.is_active })
      await couponsHook.refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.saveFailed")
      toast.error(message)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await couponsHook.remove(deleteTarget.id)
      toast.success(t("coupons.delete.success"))
      setDeleteTarget(null)
      await couponsHook.refresh()
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void couponsHook.refresh()}
            disabled={couponsHook.loading}
          >
            <RefreshCw
              className={`mr-1.5 size-4 ${couponsHook.loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-1.5 size-4" />
            {t("coupons.newCoupon")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <CouponsFiltersBar
            filters={couponsHook.filters}
            onChange={(next) => couponsHook.setFilters({ ...next, page: 1 })}
            loading={couponsHook.loading}
          />
          <CouponsTable
            coupons={couponsHook.coupons}
            loading={couponsHook.loading}
            togglingId={togglingId}
            emptyMessage={t("coupons.empty")}
            onEdit={(coupon) => {
              setEditing(coupon)
              setFormOpen(true)
            }}
            onToggle={(coupon) => void handleToggle(coupon)}
            onDelete={(coupon) => setDeleteTarget(coupon)}
          />
          <Pagination
            currentPage={couponsHook.pagination.current_page}
            totalPages={couponsHook.pagination.last_page}
            total={couponsHook.pagination.total}
            perPage={couponsHook.pagination.per_page || 15}
            disabled={couponsHook.loading}
            onPageChange={(page) =>
              couponsHook.setFilters({ ...couponsHook.filters, page })
            }
          />
        </CardContent>
      </Card>

      <SubscriptionCouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => {
          void handleSaved()
        }}
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
