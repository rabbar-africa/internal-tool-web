import type {
  BillingInterval,
  BillingOverview,
  BillingPlan,
} from "../api/types";
import { formatPrice } from "./format";

/** Starter and Enterprise have no yearly price; neither do older plans. */
export const sellsYearly = (
  plan?: Pick<BillingPlan, "annualPrice"> | null,
): plan is Pick<BillingPlan, "annualPrice"> & { annualPrice: number } =>
  plan?.annualPrice != null;

/** What they'd actually be charged: a year only where the plan is sold so. */
export const intervalFor = (
  plan: Pick<BillingPlan, "annualPrice"> | null | undefined,
  wanted: BillingInterval,
): BillingInterval =>
  wanted === "ANNUAL" && sellsYearly(plan) ? "ANNUAL" : "MONTHLY";

export const perInterval = (interval: BillingInterval) =>
  interval === "ANNUAL" ? "a year" : "a month";

/** "2 months free", or "Save ₦4,998" when it isn't whole months. */
export function describeAnnualSaving(
  saving: {
    annualSaving?: number | null;
    annualMonthsFree?: number | null;
  },
  currency = "NGN",
): string | null {
  const { annualMonthsFree, annualSaving } = saving;
  if (annualMonthsFree != null && annualMonthsFree > 0) {
    return `${annualMonthsFree} ${annualMonthsFree === 1 ? "month" : "months"} free`;
  }
  if (annualSaving != null && annualSaving > 0) {
    return `Save ${formatPrice(annualSaving, currency)}`;
  }
  return null;
}

/** The plan's price for this interval: "₦50,000 a year". */
export function describePlanPrice(
  plan: Pick<BillingPlan, "monthlyPrice" | "annualPrice" | "currency">,
  interval: BillingInterval,
) {
  const charged = intervalFor(plan, interval);
  const amount =
    charged === "ANNUAL" ? plan.annualPrice : Number(plan.monthlyPrice);
  return `${formatPrice(amount, plan.currency)} ${perInterval(charged)}`;
}

/** How they'll renew: what they last paid for, monthly if the API is older. */
export const renewalInterval = (overview: BillingOverview): BillingInterval =>
  overview.billing.billingInterval ?? overview.billingInterval ?? "MONTHLY";

/**
 * "₦50,000 a year" for the plan that renews next, a scheduled downgrade
 * included. Uses the billing summary's yearly price, as it names that plan.
 */
export function describeRenewalPrice(overview: BillingOverview) {
  const renewing = overview.pendingPlan ?? overview.plan;
  const interval = renewalInterval(overview);
  const annualPrice = overview.billing.annualPrice ?? renewing.annualPrice;
  return describePlanPrice({ ...renewing, annualPrice }, interval);
}
