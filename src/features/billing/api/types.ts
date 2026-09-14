export type PlanTier = "STARTER" | "STANDARD" | "PREMIUM";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "EXPIRED"
  | "CANCELLED"
  | "INACTIVE";

export type CheckoutStatus = "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";

export type CheckoutPurpose = "SUBSCRIPTION" | "CARD_SETUP";

export interface BillingPlan {
  id: string;
  tier: PlanTier;
  name: string;
  description?: string | null;
  /** Decimal — arrives as a string, e.g. "15000". */
  monthlyPrice: string;
  currency: string;
  isActive?: boolean;
}

export interface BillingCard {
  last4: string;
  brand: string;
  bank: string | null;
  expMonth: string;
  expYear: string;
  email: string | null;
}

export interface ActivePromo {
  code: string;
  description: string;
  remainingCycles: number;
  planTiers: PlanTier[];
}

export interface BillingPayment {
  id: string;
  amount: string;
  discountAmount: string | null;
  currency: string;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string;
  /** Free text on the API — PAYSTACK_CARD, PAYSTACK_BANK_TRANSFER, PROMO, … */
  method: string | null;
  reference: string | null;
}

export interface BillingSummary {
  /** Show the "Pay now" banner/button. */
  needsPayment: boolean;
  /** Pass as `planTier` to checkout for "Pay now". */
  renewalPlanTier: PlanTier;
  amountDue: number | null;
  discountAmount: number | null;
  promoDescription: string | null;
  currency: string;
  dueDate: string | null;
  /** Negative once the date has passed. */
  daysLeft: number | null;
  /** PAST_DUE only — after this the plan expires. */
  graceEndsAt: string | null;
  /** A saved card will be charged automatically. */
  autoCharge: boolean;
}

/** What `GET /subscriptions/me` returns. */
export interface BillingOverview {
  id: string;
  organizationId: string;
  status: SubscriptionStatus;
  plan: BillingPlan;
  /** A downgrade scheduled for the end of the current period. */
  pendingPlan: BillingPlan | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  pastDueSince: string | null;
  failedChargeAttempts: number;
  /** The tier the org actually gets (lapsed plans fall back to Starter). */
  effectiveTier: PlanTier;
  card: BillingCard | null;
  activePromo: ActivePromo | null;
  payments: BillingPayment[];
  billing: BillingSummary;
}

export interface CheckoutPreviewPayload {
  planTier: PlanTier;
  promoCode?: string;
}

export interface CheckoutPayload extends CheckoutPreviewPayload {
  saveCard?: boolean;
}

export interface CheckoutPreview {
  plan: { id: string; tier: PlanTier; name: string };
  currency: string;
  listPrice: number;
  discountAmount: number;
  amount: number;
  periodMonths: number;
  promoCode: string | null;
  promoDescription: string | null;
  promoCodeId: string | null;
  promoCyclesUsed: number;
}

export type CheckoutResult =
  | {
      status: "redirect";
      reference: string;
      authorizationUrl: string;
      amount: number;
      currency: string;
    }
  | { status: "activated"; subscription: unknown };

/** What `GET /billing/pay/:token` returns for the public pay page. */
export interface PayLinkSummary {
  organizationName: string;
  plan: { tier: PlanTier; name: string };
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  currency: string;
  amount: number;
  discountAmount: number;
  periodMonths: number;
  promoDescription: string | null;
}

/** What `GET /billing/checkout/:reference` returns after Paystack redirects back. */
export interface CheckoutStatusResult {
  reference: string;
  status: CheckoutStatus;
  purpose: CheckoutPurpose;
  amount: number;
  currency: string;
  plan: { tier: PlanTier; name: string } | null;
  currentPeriodEnd: string | null;
}
