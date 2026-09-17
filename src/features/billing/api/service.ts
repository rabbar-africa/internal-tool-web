import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import { type ApiResponse } from "@/shared/interface/api";
import type {
  BillingOverview,
  BillingPlan,
  CheckoutPayload,
  CheckoutPreview,
  CheckoutPreviewPayload,
  CheckoutResult,
  CheckoutStatusResult,
  PayLinkSummary,
  PlanTier,
} from "./types";

const { billing } = QUERY_PATH;

export const billingService = {
  getOverview: async (): Promise<BillingOverview> => {
    const response = await axios.get<ApiResponse<BillingOverview>>(
      billing.overview,
    );
    return response.data.data;
  },

  getPlans: async (): Promise<BillingPlan[]> => {
    const response = await axios.get<ApiResponse<BillingPlan[]>>(billing.plans);
    return response.data.data;
  },

  /** Prices a plan (with an optional promo code). 400 when the code is bad. */
  previewCheckout: async (
    payload: CheckoutPreviewPayload,
  ): Promise<CheckoutPreview> => {
    const response = await axios.post<ApiResponse<CheckoutPreview>>(
      billing.checkoutPreview,
      payload,
    );
    return response.data.data;
  },

  checkout: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
    const response = await axios.post<ApiResponse<CheckoutResult>>(
      billing.checkout,
      payload,
    );
    return response.data.data;
  },

  /** Starts a ₦50 (refunded) card check so the card can be saved. */
  addCard: async (): Promise<CheckoutResult> => {
    const response = await axios.post<ApiResponse<CheckoutResult>>(
      billing.card,
    );
    return response.data.data;
  },

  removeCard: async (): Promise<BillingOverview> => {
    const response = await axios.delete<ApiResponse<BillingOverview>>(
      billing.card,
    );
    return response.data.data;
  },

  setAutoRenew: async (autoRenew: boolean): Promise<BillingOverview> => {
    const response = await axios.patch<ApiResponse<BillingOverview>>(
      billing.autoRenew,
      { autoRenew },
    );
    return response.data.data;
  },

  /** Schedules a downgrade (or Starter) for the end of the current period. */
  changePlan: async (planTier: PlanTier): Promise<BillingOverview> => {
    const response = await axios.post<ApiResponse<BillingOverview>>(
      billing.changePlan,
      { planTier },
    );
    return response.data.data;
  },

  cancel: async (): Promise<BillingOverview> => {
    const response = await axios.post<ApiResponse<BillingOverview>>(
      billing.cancel,
    );
    return response.data.data;
  },

  /** Undoes a scheduled cancel or downgrade. */
  resume: async (): Promise<BillingOverview> => {
    const response = await axios.post<ApiResponse<BillingOverview>>(
      billing.resume,
    );
    return response.data.data;
  },

  // ─── Public (no login) ─────────────────────────────────────────────────────

  getPayLink: async (token: string): Promise<PayLinkSummary> => {
    const response = await axios.get<ApiResponse<PayLinkSummary>>(
      `${billing.payLink}/${token}`,
    );
    return response.data.data;
  },

  payFromLink: async (token: string): Promise<CheckoutResult> => {
    const response = await axios.post<ApiResponse<CheckoutResult>>(
      `${billing.payLink}/${token}`,
    );
    return response.data.data;
  },

  getCheckoutStatus: async (
    reference: string,
  ): Promise<CheckoutStatusResult> => {
    const response = await axios.get<ApiResponse<CheckoutStatusResult>>(
      `${billing.checkoutStatus}/${encodeURIComponent(reference)}`,
    );
    return response.data.data;
  },
};
