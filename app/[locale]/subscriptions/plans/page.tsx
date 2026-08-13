"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { buttonVariants } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"

import {
  subscriptionPlanService,
  type SubscriptionPlan,
} from "src/modules/subscriptions"
import { ApiClientError } from "@/lib/apiClient"

export default function SubscriptionPlansBrowsePage() {
  const locale = useLocale()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await subscriptionPlanService.listPublic()
        if (cancelled) return
        setPlans(data)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiClientError ? err.message : "Failed to load plans"
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 lg:px-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Subscription plans</h1>
        <p className="text-base text-muted-foreground">
          Pick the plan that matches your publishing needs.
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && plans.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No plans available.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && plans.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.is_active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="text-3xl font-bold">
                    {plan.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="ml-1 text-base font-medium text-muted-foreground">
                      {plan.currency ?? ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    / {plan.duration_days} days
                  </p>
                </div>
                {plan.feature_details && plan.feature_details.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {plan.feature_details.map((feature) => (
                      <li key={feature.id} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 text-primary" />
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          {feature.description && (
                            <p className="text-xs text-muted-foreground">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Features will be listed here.
                  </p>
                )}
                <Link
                  href={`/${locale}/checkout?plan_id=${plan.id}`}
                  className={cn(buttonVariants({ variant: "default" }), "mt-auto")}
                >
                  Subscribe
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
