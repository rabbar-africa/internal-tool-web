export type PlanTier = "STARTER" | "STANDARD" | "PREMIUM";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "EXPIRED"
  | "CANCELLED"
  | "INACTIVE";

/** How long one payment covers. Leaving it out of a checkout means a month. */
export type BillingInterval = "MONTHLY" | "ANNUAL";

export type CheckoutStatus = "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";

export type CheckoutPurpose = "SUBSCRIPTION" | "CARD_SETUP";

/** On/off entitlements. `(string & {})`: a new backend key must not break the build. */
export type PlanFeature =
  | "reminders"
  | "businessStatement"
  | "noRabbarBranding"
  | "invoiceTerms"
  | "defaultVat"
  | "recurringExpenses"
  | "dailyRecurringExpenses"
  | (string & {});

/** Counted entitlements. */
export type PlanLimit =
  | "invoices"
  | "customers"
  | "users"
  | "templates"
  | "jobCards"
  | "inspections"
  | "paperwork"
  | (string & {});

/** `month` resets on the 1st, `year` on 1 January (Lagos time). */
export type LimitPeriod = "total" | "month" | "year";

/** How much of a limit is used. `limit`/`remaining` are null with no cap. */
export interface LimitUsage {
  used: number;
  limit: number | null;
  remaining: number | null;
  per: LimitPeriod;
  /**
   * A start then an allowance (Starter's invoices: 15, then 3 a month): which
   * applies now. `used`/`limit`/`remaining`/`per` are for that one, so `per`
   * turns from "total" to "month" once the 15 are used.
   */
  stage?: "start" | "then";
  /** With `stage`: what comes after the start, each month or year. */
  then?: LimitAfter;
  /** With `stage`: made in all. */
  totalUsed?: number;
  /** With `stage`: the size of the start (15). */
  startLimit?: number;
  /** Templates only: the allowance is per type, so check the type on screen. */
  byDocumentType?: Record<string, number>;
}

/** The allowance after a starting total. */
export interface LimitAfter {
  max: number;
  per: "month" | "year";
}

/** A row of what a plan includes, ready to print. */
export interface PlanFeatureRow {
  key: string;
  label: string;
  included: boolean;
  /** On the price list, but not built yet. */
  comingSoon: boolean;
}

export interface PlanLimitRow {
  key: string;
  label: string;
  max: number | null;
  per: LimitPeriod;
  /** After a "total" start: what comes each month or year, for good. */
  then?: LimitAfter | null;
  /** "15 invoices", "100 invoices a month", "15 invoices, then 3 a month". */
  phrase: string;
  comingSoon: boolean;
}

export interface BillingPlan {
  id: string;
  tier: PlanTier;
  name: string;
  description?: string | null;
  /** Decimal — arrives as a string, e.g. "15000". */
  monthlyPrice: string;
  currency: string;
  /** Null when the plan isn't sold by the year (Starter, Enterprise). */
  annualPrice?: number | null;
  /** What a year saves against 12 monthly payments. */
  annualSaving?: number | null;
  /** Null when the saving isn't a whole number of months. */
  annualMonthsFree?: number | null;
  isActive?: boolean;
  features?: PlanFeatureRow[];
  limits?: PlanLimitRow[];
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
  /** 12 for a yearly payment. */
  periodMonths?: number | null;
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
  /** How the plan that renews will be charged. */
  billingInterval?: BillingInterval;
  /** For the plan that renews. */
  annualPrice?: number | null;
  annualSaving?: number | null;
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
  /** What they last paid for, and what the next renewal charges. */
  billingInterval?: BillingInterval;
  cancelAtPeriodEnd: boolean;
  pastDueSince: string | null;
  failedChargeAttempts: number;
  /** The tier the org actually gets (lapsed plans fall back to Starter). */
  effectiveTier: PlanTier;
  /** Feature keys the effective plan includes. */
  features?: PlanFeature[];
  /** Every limit with how much is used. */
  limits?: Record<PlanLimit, LimitUsage>;
  card: BillingCard | null;
  activePromo: ActivePromo | null;
  payments: BillingPayment[];
  billing: BillingSummary;
}

export interface CheckoutPreviewPayload {
  planTier: PlanTier;
  /** Promo codes are monthly only: the API refuses one with ANNUAL. */
  promoCode?: string;
  billingInterval?: BillingInterval;
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
  billingInterval?: BillingInterval;
  monthlyPrice?: number;
  annualPrice?: number | null;
  annualSaving?: number | null;
  annualMonthsFree?: number | null;
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

/**
 * What `GET /billing/pay/:token` returns for the public pay page. Two kinds of
 * link share the page: RENEWAL, the "Pay now" link in billing emails (pays for
 * the plan on file), and PLAN, a link Rabbar support made for one plan.
 */
export interface PayLinkSummary {
  kind?: "RENEWAL" | "PLAN";
  /** ANNUAL: a year at once (`periodMonths` is 12). */
  billingInterval?: BillingInterval;
  /** PLAN only: the end of the last day the link works. */
  expiresAt?: string;
  /** PLAN only: whoever pays works in the WhatsApp bot. */
  onWhatsapp?: boolean;
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
  /** The payer works in the WhatsApp bot: send them back to the chat. */
  onWhatsapp?: boolean;
}
