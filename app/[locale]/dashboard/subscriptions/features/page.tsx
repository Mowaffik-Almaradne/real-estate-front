"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"

import { ApiClientError } from "@/lib/apiClient"

import {
  SubscriptionDeleteDialog,
  SubscriptionFeatureFormDialog,
  SubscriptionFeaturesFiltersBar,
  SubscriptionFeaturesTable,
  useSubscriptionFeatures,
  useSubscriptionsTranslations,
  type SubscriptionFeature,
} from "src/modules/subscriptions"

export default function SubscriptionFeaturesPage() {
  const { t } = useSubscriptionsTranslations()
  const featuresHook = useSubscriptionFeatures()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionFeature | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionFeature | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await featuresHook.remove(deleteTarget.id)
      toast.success(t("features.delete.success"))
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
        <p className="text-sm text-muted-foreground">{t("features.subtitle")}</p>
        <Button onClick={handleNew}>
          <Plus className="mr-1.5 size-4" />
          {t("features.newFeature")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <SubscriptionFeaturesFiltersBar
            filters={featuresHook.filters}
            onChange={featuresHook.setFilters}
            loading={featuresHook.loading}
          />
          <SubscriptionFeaturesTable
            features={featuresHook.features}
            loading={featuresHook.loading}
            emptyMessage={t("features.empty")}
            onEdit={(feature) => {
              setEditing(feature)
              setFormOpen(true)
            }}
            onDelete={(feature) => setDeleteTarget(feature)}
          />
        </CardContent>
      </Card>

      <SubscriptionFeatureFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={(feature) => {
          setEditing(null)
        }}
      />

      <SubscriptionDeleteDialog
        open={Boolean(deleteTarget)}
        submitting={deleting}
        titleKey="features.delete.title"
        descriptionKey="features.delete.description"
        confirmKey="features.delete.confirm"
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
