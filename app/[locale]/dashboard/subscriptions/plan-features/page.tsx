"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"

import { ApiClientError, getApiData, type ApiResponse } from "@/lib/apiClient"

import {
  adminSubscriptionPlanFeatureService,
  adminSubscriptionFeatureService,
  adminSubscriptionPlanService,
  useSubscriptionsTranslations,
  type SubscriptionFeature,
  type SubscriptionPlan,
  type SubscriptionPlanFeatureLink,
  type CreateSubscriptionPlanFeatureRequest,
  type UpdateSubscriptionPlanFeatureRequest,
} from "src/modules/subscriptions"

export default function SubscriptionPlanFeaturesPage() {
  const { t } = useSubscriptionsTranslations()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [features, setFeatures] = useState<SubscriptionFeature[]>([])
  const [links, setLinks] = useState<SubscriptionPlanFeatureLink[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [newPlanId, setNewPlanId] = useState<string>("")
  const [newFeatureId, setNewFeatureId] = useState<string>("")
  const [newLimit, setNewLimit] = useState<string>("")
  const [newEnabled, setNewEnabled] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [planList, featureList, linkList] = await Promise.all([
        adminSubscriptionPlanService.list({ perPage: 100 }),
        adminSubscriptionFeatureService.list({ perPage: 100 }),
        adminSubscriptionPlanFeatureService.list({ perPage: 100 }),
      ])
      setPlans(planList.data)
      setFeatures(featureList.data)
      setLinks(linkList.data)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.loadFailed")
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleCreate = async () => {
    if (!newPlanId || !newFeatureId) {
      toast.error(t("plans.syncFeatures.failure"))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateSubscriptionPlanFeatureRequest = {
        plan_id: Number(newPlanId),
        feature_id: Number(newFeatureId),
        is_enabled: newEnabled,
        limit_value: newLimit === "" ? null : Number(newLimit),
      }
      await adminSubscriptionPlanFeatureService.create(payload)
      toast.success(t("plans.syncFeatures.success"))
      setNewPlanId("")
      setNewFeatureId("")
      setNewLimit("")
      setNewEnabled(true)
      await refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.saveFailed")
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (
    link: SubscriptionPlanFeatureLink,
    patch: UpdateSubscriptionPlanFeatureRequest
  ) => {
    try {
      await adminSubscriptionPlanFeatureService.update(link.id, patch)
      await refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.saveFailed")
      toast.error(message)
    }
  }

  const handleDelete = async (link: SubscriptionPlanFeatureLink) => {
    try {
      await adminSubscriptionPlanFeatureService.remove(link.id)
      toast.success(t("features.delete.success"))
      await refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("errors.deleteFailed")
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("plans.detail.featuresTitle")}</p>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="link-plan">{t("plans.columns.name")}</Label>
              <select
                id="link-plan"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
              >
                <option value="">—</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-feature">{t("features.columns.name")}</Label>
              <select
                id="link-feature"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={newFeatureId}
                onChange={(e) => setNewFeatureId(e.target.value)}
              >
                <option value="">—</option>
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-limit">{t("plans.columns.features")}</Label>
              <Input
                id="link-limit"
                type="number"
                min={0}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
              />
            </div>
            <div className="flex items-end justify-between rounded-md border p-3">
              <span className="text-sm font-medium">
                {t("plans.form.isActiveLabel")}
              </span>
              <Switch checked={newEnabled} onCheckedChange={setNewEnabled} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => void handleCreate()} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("features.form.create")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          {loading && links.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 w-full rounded bg-muted" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("plans.detail.noFeatures")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th className="px-2 py-2">Plan</th>
                    <th className="px-2 py-2">Feature</th>
                    <th className="px-2 py-2">Enabled</th>
                    <th className="px-2 py-2">Limit</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const plan = plans.find((p) => p.id === link.plan_id)
                    const feature = features.find(
                      (f) => f.id === link.feature_id
                    )
                    return (
                      <tr key={link.id} className="border-b">
                        <td className="px-2 py-2">{plan?.name ?? link.plan_id}</td>
                        <td className="px-2 py-2">
                          {feature?.name ?? link.feature_id}
                        </td>
                        <td className="px-2 py-2">
                          <Switch
                            checked={link.is_enabled !== false}
                            onCheckedChange={(checked) =>
                              void handleUpdate(link, { is_enabled: checked })
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min={0}
                            defaultValue={link.limit_value ?? ""}
                            onBlur={(event) => {
                              const value =
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value)
                              void handleUpdate(link, { limit_value: value })
                            }}
                            className="h-8 w-24"
                          />
                        </td>
                        <td className="px-2 py-2 text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDelete(link)}
                          >
                            {t("features.delete.confirm")}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
