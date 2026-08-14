/**
 * Documented checkout contract per
 * `docs/backend/new-api-documentation/openapi.yaml`:
 *
 * POST /api/checkout
 *   request:
 *     { plan_id: number, coupon_code?: string, payment_method?: "stripe"|"balance" }
 *   response:
 *     { checkout_url?: string, subscription?: SubscriptionDto, message?: string }
 *
 * The backend may either return a redirect URL (Stripe) or a completed
 * subscription (balance payment). The frontend must follow whatever it gets.
 */
export type CheckoutPaymentMethod = "stripe" | "balance"

export interface CheckoutRequest {
  plan_id: number
  coupon_code?: string | null
  payment_method?: CheckoutPaymentMethod
}

export interface CheckoutSubscriptionSummary {
  id: number
  plan_id: number
  status?: string
  starts_at?: string
  ends_at?: string
}

export interface CheckoutResponse {
  checkout_url?: string | null
  subscription?: CheckoutSubscriptionSummary | null
  message?: string | null
}
