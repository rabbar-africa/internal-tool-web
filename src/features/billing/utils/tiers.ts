import type { PlanTier } from "../api/types";

/** Lowest to highest: what "the next plan up" means. Mirrors the API. */
export const PLAN_TIER_ORDER: readonly PlanTier[] = [
  "STARTER",
  "STANDARD",
  "PREMIUM",
];

export const HIGHEST_PLAN_TIER = PLAN_TIER_ORDER[PLAN_TIER_ORDER.length - 1];

export const isTierAbove = (tier: PlanTier, other: PlanTier) =>
  PLAN_TIER_ORDER.indexOf(tier) > PLAN_TIER_ORDER.indexOf(other);
