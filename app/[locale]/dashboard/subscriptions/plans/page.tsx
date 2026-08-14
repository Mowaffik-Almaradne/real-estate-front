"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"

import { ApiClientError } from "@/lib/apiClient"

import {
  SubscriptionDeleteDialog,
  SubscriptionPlanFormDialog,
  SubscriptionPlansFiltersBar,
  SubscriptionPlansGrid,
  useSubscriptionPlans,
  useSubscriptionsTranslations,
  type SubscriptionPlan,
} from "src/modules/subscriptions"

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const { t } = useSubscriptionsTranslations()
  const plansHook = useSubscriptionPlans()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSaved = () => {
    setEditing(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await plansHook.remove(deleteTarget.id)
      toast.success(t("plans.delete.success"))
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
        <p className="text-sm text-muted-foreground">{t("plans.subtitle")}</p>
        <Button onClick={handleNew}>
          <Plus className="mr-1.5 size-4" />
          {t("plans.newPlan")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <SubscriptionPlansFiltersBar
            filters={plansHook.filters}
            onChange={plansHook.setFilters}
            loading={plansHook.loading}
          />
          <SubscriptionPlansGrid
            plans={plansHook.plans}
            loading={plansHook.loading}
            pagination={plansHook.pagination}
            emptyMessage={t("plans.empty")}
            onEdit={(plan) => {
              setEditing(plan)
              setFormOpen(true)
            }}
            onDelete={(plan) => setDeleteTarget(plan)}
          />
        </CardContent>
      </Card>

      <SubscriptionPlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={handleSaved}
      />

      <SubscriptionDeleteDialog
        open={Boolean(deleteTarget)}
        submitting={deleting}
        titleKey="plans.delete.title"
        descriptionKey="plans.delete.description"
        confirmKey="plans.delete.confirm"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
