import type { BillingInterval, PlanTier } from "@/features/billing/api/types";

/** The paid plan picked on the landing page, to check out after signup. */
export interface SignupPlan {
  planTier: PlanTier;
  billingInterval: BillingInterval;
}

// Starter is free and Enterprise is agreed with us: neither is paid at signup.
const NOT_CHECKED_OUT = new Set(["STARTER", "ENTERPRISE"]);

const PLAN_NAMES: Record<string, string> = {
  WHATSAPP: "Chat Lite",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

/**
 * Reads `?planTier=STANDARD&billingInterval=ANNUAL` from the landing page's
 * signup link. Null for Starter, Enterprise or no plan at all. The API checks
 * the tier itself, so an unknown one only fails at checkout.
 */
export function readSignupPlan(params: URLSearchParams): SignupPlan | null {
  const tier = (params.get("planTier") ?? "").trim().toUpperCase();
  if (!/^[A-Z_]+$/.test(tier) || NOT_CHECKED_OUT.has(tier)) return null;
  const interval = (params.get("billingInterval") ?? "").trim().toUpperCase();
  return {
    planTier: tier as PlanTier,
    billingInterval: interval === "ANNUAL" ? "ANNUAL" : "MONTHLY",
  };
}

/** "Standard", or the tier title-cased when it's one we don't know yet. */
export const signupPlanName = ({ planTier }: SignupPlan) =>
  PLAN_NAMES[planTier] ??
  planTier.charAt(0) + planTier.slice(1).toLowerCase().replace(/_/g, " ");
