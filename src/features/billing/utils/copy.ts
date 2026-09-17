import type { BillingOverview, BillingPlan } from "../api/types";
import {
  describeDaysLeft,
  formatCardBrand,
  formatLongDate,
  formatPrice,
  formatShortDate,
} from "./format";

/**
 * Plain-language copy for billing. The people reading this are busy
 * mechanics, not accountants: say what happened, when, and what to do.
 */

export const PAYMENT_OPTIONS_NOTE =
  "You can pay by bank transfer, USSD or card.";

export const ASK_ADMIN_NOTE = "Ask your admin to pay.";

export type BillingTone = "success" | "warning" | "error" | "neutral";

export const TONE_STYLES: Record<
  BillingTone,
  { bg: string; color: string; border: string }
> = {
  success: { bg: "success.50", color: "success.400", border: "success.75" },
  warning: { bg: "warning.50", color: "warning.700", border: "warning.200" },
  error: { bg: "error.50", color: "error.400", border: "error.75" },
  neutral: { bg: "gray.50", color: "gray.400", border: "gray.75" },
};

export const isPaidPlan = (plan?: Pick<BillingPlan, "tier"> | null) =>
  Boolean(plan && plan.tier !== "STARTER");

/** Mirrors the API: a paid plan that is active and not yet past its end. */
export function isInPaidPeriod(overview: BillingOverview) {
  return (
    overview.status === "ACTIVE" &&
    isPaidPlan(overview.plan) &&
    Boolean(overview.currentPeriodEnd) &&
    new Date(overview.currentPeriodEnd as string).getTime() > Date.now()
  );
}

/** The plan that "Pay now" renews — a scheduled downgrade wins. */
export const renewalPlanName = (overview: BillingOverview) =>
  (overview.pendingPlan ?? overview.plan).name;

/** Short status label for the plan badge. */
export function describeStatus(overview: BillingOverview): {
  label: string;
  tone: BillingTone;
} {
  switch (overview.status) {
    case "ACTIVE":
      if (!isPaidPlan(overview.plan)) {
        return { label: "Free plan", tone: "neutral" };
      }
      return overview.billing.needsPayment
        ? { label: "Due soon", tone: "warning" }
        : { label: "Active", tone: "success" };
    case "PAST_DUE":
      return { label: "Payment overdue", tone: "error" };
    case "EXPIRED":
      return { label: "Ended", tone: "error" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "neutral" };
    default:
      return { label: "Not active", tone: "neutral" };
  }
}

/**
 * The "you need to pay" sentence for the banner and the billing page, or
 * null when nothing is due.
 */
export function describeDue(
  overview: BillingOverview,
): { tone: BillingTone; message: string } | null {
  const { billing } = overview;
  if (!billing.needsPayment) return null;

  const plan = renewalPlanName(overview);
  const amount = formatPrice(billing.amountDue, billing.currency);

  // Checked before the overdue date test: an expired plan's due date is also
  // in the past, but it needs the "you're on Starter now" message instead.
  if (overview.status === "EXPIRED") {
    return {
      tone: "error",
      message: `Your ${plan} plan has ended, so you're now on the free Starter plan. Pay ${amount} to get ${plan} back.`,
    };
  }

  // Overdue is decided by the date, not the status, so the message is right
  // even if the status hasn't caught up yet.
  const dueDate = billing.dueDate ?? overview.currentPeriodEnd;
  if (dueDate && new Date(dueDate).getTime() <= Date.now()) {
    const by = billing.graceEndsAt
      ? ` by ${formatShortDate(billing.graceEndsAt)}`
      : "";
    return {
      tone: "error",
      message: `Your ${plan} plan ended on ${formatShortDate(dueDate)}. Pay ${amount}${by} to keep using it.`,
    };
  }

  const when =
    billing.daysLeft != null ? describeDaysLeft(billing.daysLeft) : "soon";
  const on = billing.dueDate ? ` (${formatShortDate(billing.dueDate)})` : "";
  return {
    tone: "warning",
    message: `Your ${plan} plan ends ${when}${on}. Pay ${amount} to keep using it.`,
  };
}

/** A few plain sentences about where the plan stands right now. */
export function describePlanSummary(overview: BillingOverview): string[] {
  const { plan, pendingPlan, billing, card } = overview;
  const end = formatLongDate(overview.currentPeriodEnd);

  if (!isPaidPlan(plan)) {
    return [
      "You're on the free Starter plan. Pick a paid plan below whenever you're ready.",
    ];
  }

  switch (overview.status) {
    case "ACTIVE": {
      const paidUntil = end
        ? `Your ${plan.name} plan is paid until ${end}.`
        : `Your ${plan.name} plan is active.`;
      if (overview.cancelAtPeriodEnd) {
        return [
          paidUntil,
          "It won't renew. After that you'll move to the free Starter plan.",
        ];
      }
      if (pendingPlan) {
        return [
          paidUntil,
          `After that you'll switch to the ${pendingPlan.name} plan.`,
        ];
      }
      if (billing.autoCharge && card) {
        return [
          paidUntil,
          `We'll charge your ${formatCardBrand(card.brand)} card ending in ${card.last4}${end ? ` on ${end}` : ""}.`,
        ];
      }
      return [
        paidUntil,
        "We'll email you before it ends so you can pay by bank transfer, USSD or card.",
      ];
    }
    case "PAST_DUE": {
      const lines = [
        end
          ? `Your ${plan.name} plan ended on ${end} and hasn't been paid yet.`
          : `Your ${plan.name} plan hasn't been paid yet.`,
      ];
      if (billing.graceEndsAt) {
        lines.push(
          `Everything keeps working until ${formatLongDate(billing.graceEndsAt)}. After that you'll move to the free Starter plan.`,
        );
      }
      return lines;
    }
    case "EXPIRED":
      return [
        end
          ? `Your ${plan.name} plan ended on ${end}.`
          : `Your ${plan.name} plan has ended.`,
        `You're on the free Starter plan for now. Pay to get ${plan.name} back.`,
      ];
    case "CANCELLED":
      return ["Your plan has been cancelled. Contact us if you need help."];
    default:
      return ["Your plan isn't active right now. Contact us if you need help."];
  }
}
