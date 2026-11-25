import type { PlanTier } from "../api/types";

/**
 * Lowest to highest: what "the next plan up" means. Mirrors the API, less
 * Enterprise, which is never offered (and is above everything anyway).
 */
export const PLAN_TIER_ORDER: readonly PlanTier[] = [
  "STARTER",
  "WHATSAPP",
  "STANDARD",
  "PREMIUM",
];

export const HIGHEST_PLAN_TIER = "PREMIUM" satisfies PlanTier;

/**
 * Chat Lite is the WhatsApp bot's plan: it makes the web app view only, so
 * the web app never shows it. The bot offers it there.
 */
const NOT_ON_WEB: readonly PlanTier[] = ["WHATSAPP"];

export const isOfferedOnWeb = (plan: { tier: PlanTier }) =>
  !NOT_ON_WEB.includes(plan.tier);

export const isTierAbove = (tier: PlanTier, other: PlanTier) =>
  PLAN_TIER_ORDER.indexOf(tier) > PLAN_TIER_ORDER.indexOf(other);
