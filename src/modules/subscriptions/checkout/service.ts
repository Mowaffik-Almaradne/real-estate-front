import {
  apiClient,
  ApiClientError,
  getApiData,
  type ApiResponse,
} from "@/lib/apiClient"
import type { CheckoutRequest, CheckoutResponse } from "./types"

export { ApiClientError as CheckoutServiceError }

/**
 * POST /api/checkout. The backend returns either:
 *   - a `checkout_url` (Stripe flow — frontend should redirect)
 *   - a `subscription` summary (balance flow — frontend should refresh)
 */
export const checkoutService = {
  async start(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
      "/checkout",
      request
    )
    return getApiData(response)
  },
}
