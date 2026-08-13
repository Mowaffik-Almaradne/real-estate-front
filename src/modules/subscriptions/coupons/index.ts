export {
  couponService,
  adminCouponService,
  CouponServiceError,
} from "./service"

export type {
  SubscriptionDiscount,
  CreateSubscriptionDiscountRequest,
  UpdateSubscriptionDiscountRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
  SubscriptionDiscountFilters,
  SubscriptionDiscountsResponse,
} from "./types"

export { SUBSCRIPTION_DISCOUNT_CODE_MAX } from "./types"

export {
  subscriptionDiscountFormSchema,
  validateCouponRequestSchema,
  type SubscriptionDiscountFormValues,
  type ValidateCouponFormValues,
} from "./schemas"

export {
  useCoupons,
  useCouponValidation,
  type UseCouponsResult,
  type UseCouponValidationResult,
} from "./hooks"

export { SubscriptionCouponFormDialog } from "./CouponFormDialog"
export { CouponsTable, CouponsFiltersBar } from "./CouponsTable"
export { CouponValidationPanel } from "./CouponValidationPanel"
