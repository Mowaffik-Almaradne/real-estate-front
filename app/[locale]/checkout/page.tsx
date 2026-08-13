"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { Check, CreditCard, Loader2, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"

import {
  CouponValidationPanel,
  useCheckout,
  type CheckoutPaymentMethod,
  type CheckoutResponse,
  type SubscriptionPlan,
} from "src/modules/subscriptions"
import { subscriptionPlanService } from "src/modules/subscriptions"
import { ApiClientError } from "@/lib/apiClient"
import { useSubscriptionsTranslations } from "src/modules/subscriptions"

function formatAmount(value: number, currency?: string | null): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency ?? ""}`.trim()
}

export default function CheckoutPage() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const { t } = useSubscriptionsTranslations()

  const planIdParam = searchParams?.get("plan_id") ?? null
  const planId = useMemo(() => {
    if (!planIdParam) return null
    const value = Number(planIdParam)
    return Number.isFinite(value) && value > 0 ? value : null
  }, [planIdParam])

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("stripe")
  const [coupon, setCoupon] = useState<{
    code: string
    discount_amount: number
    final_amount: number
  } | null>(null)
  const [completedSubscriptionId, setCompletedSubscriptionId] = useState<
    number | null
  >(null)
  const { result, loading: checkoutLoading, error: checkoutError, start } =
    useCheckout()

  useEffect(() => {
    if (!planId) {
      setPlan(null)
      setPlanError("Missing plan id")
      return
    }
    let cancelled = false
    void (async () => {
      setLoadingPlan(true)
      setPlanError(null)
      try {
        const data = await subscriptionPlanService.getPublicById(planId)
        if (cancelled) return
        setPlan(data)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiClientError ? err.message : "Failed to load plan"
        setPlanError(message)
      } finally {
        if (!cancelled) setLoadingPlan(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [planId])

  const handleCheckout = async () => {
    if (!plan) return
    try {
      const response: CheckoutResponse = await start({
        plan_id: plan.id,
        coupon_code: coupon?.code ?? undefined,
        payment_method: paymentMethod,
      })
      if (response.checkout_url) {
        // Stripe flow: hand off to the URL the backend returned.
        if (typeof window !== "undefined") {
          window.location.href = response.checkout_url
        }
        return
      }
      if (response.subscription?.id) {
        setCompletedSubscriptionId(response.subscription.id)
        toast.success(
          response.message ?? t("checkout.completed.title")
        )
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("checkout.error.generic")
      toast.error(message)
    }
  }

  if (!planId) {
    return (
      <div className="container mx-auto px-4 py-10 lg:px-8">
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted-foreground">
              {t("checkout.missingPlan")}
            </p>
            <Button variant="outline" onClick={() => router.push(`/${locale}/subscriptions/plans`)}>
              {t("checkout.backToPlans")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingPlan) {
    return (
      <div className="container mx-auto px-4 py-10 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (planError || !plan) {
    return (
      <div className="container mx-auto px-4 py-10 lg:px-8">
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-destructive">
              {planError ?? t("checkout.planNotFound")}
            </p>
            <Button variant="outline" onClick={() => router.push(`/${locale}/subscriptions/plans`)}>
              {t("checkout.backToPlans")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const finalPrice = coupon?.final_amount ?? plan.price

  return (
    <div className="container mx-auto space-y-8 px-4 py-10 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("checkout.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("checkout.subtitle")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("checkout.review.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.duration_days} {t("checkout.review.days")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatAmount(plan.price, plan.currency)}
                  </p>
                </div>
              </div>
              {plan.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              )}
            </div>

            {plan.feature_details && plan.feature_details.length > 0 && (
              <div>
                <p className="text-sm font-medium">
                  {t("checkout.review.features")}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
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
              </div>
            )}

            <CouponValidationPanel
              planId={plan.id}
              planPrice={plan.price}
              currency={plan.currency}
              onApplied={(info) => setCoupon(info)}
              onCleared={() => setCoupon(null)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("checkout.summary.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("checkout.summary.subtotal")}
                </span>
                <span>{formatAmount(plan.price, plan.currency)}</span>
              </div>
              {coupon && coupon.discount_amount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>{t("checkout.summary.discount")}</span>
                  <span>
                    -{formatAmount(coupon.discount_amount, plan.currency)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                <span>{t("checkout.summary.total")}</span>
                <span>{formatAmount(finalPrice, plan.currency)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("checkout.paymentMethod.label")}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                    paymentMethod === "stripe"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="mt-1 size-4 accent-primary"
                  />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="size-4" />
                      {t("checkout.paymentMethod.stripe")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("checkout.paymentMethod.stripeHint")}
                    </p>
                  </div>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                    paymentMethod === "balance"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value="balance"
                    checked={paymentMethod === "balance"}
                    onChange={() => setPaymentMethod("balance")}
                    className="mt-1 size-4 accent-primary"
                  />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4" />
                      {t("checkout.paymentMethod.balance")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("checkout.paymentMethod.balanceHint")}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {checkoutError && (
              <p className="text-xs text-destructive">{checkoutError}</p>
            )}

            {completedSubscriptionId ? (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">{t("checkout.completed.title")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("checkout.completed.detail", {
                        id: completedSubscriptionId,
                      })}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {t("checkout.completed.viewDashboard")}
                    </Badge>
                    <Button
                      size="sm"
                      variant="link"
                      className="px-0"
                      onClick={() =>
                        router.push(
                          `/${locale}/dashboard/subscriptions/current`
                        )
                      }
                    >
                      {t("checkout.completed.goToSubscription")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => void handleCheckout()}
                disabled={checkoutLoading}
              >
                {checkoutLoading && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("checkout.submit", {
                  amount: formatAmount(finalPrice, plan.currency),
                })}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
