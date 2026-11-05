import { useBillingPlansQuery } from "../api/query";
import type { BillingPlan, PlanFeature, PlanLimit } from "../api/types";
import { isTierAbove, PLAN_TIER_ORDER } from "../utils/tiers";
import { usePlanAccess } from "./usePlanAccess";

export interface UpgradeOption {
  /** The plan to offer. Undefined while loading, or when no plan would help. */
  plan?: BillingPlan;
  /** Worth offering an upgrade: true while unknown, as the API has the final say. */
  isAvailable: boolean;
}

/**
 * The lowest plan on sale, above the current one, that would actually help.
 * Mirrors the API's `upgradeTo`: never the plan they're on, and never just the
 * cheapest, since a feature may only be on a higher plan.
 */
function useUpgradeOption(
  gives: (plan: BillingPlan) => boolean,
  enabled: boolean,
): UpgradeOption {
  const { tier, canUpgrade } = usePlanAccess();
  const { data: plans } = useBillingPlansQuery({
    enabled: enabled && canUpgrade,
  });
  if (!canUpgrade || !tier) return { isAvailable: false };
  if (!plans) return { isAvailable: true };

  const plan = [...plans]
    .sort(
      (a, b) =>
        PLAN_TIER_ORDER.indexOf(a.tier) - PLAN_TIER_ORDER.indexOf(b.tier),
    )
    .find(
      (candidate) =>
        candidate.isActive !== false &&
        isTierAbove(candidate.tier, tier) &&
        gives(candidate),
    );
  return { plan, isAvailable: Boolean(plan) };
}

/** Which plan unlocks this feature. */
export function useFeatureUpgrade(
  feature: PlanFeature,
  enabled = true,
): UpgradeOption {
  return useUpgradeOption(
    (plan) =>
      Boolean(plan.features?.find((row) => row.key === feature)?.included),
    enabled,
  );
}

/** Which plan raises this limit above what they have now. */
export function useLimitUpgrade(
  limit: PlanLimit,
  currentMax: number | null | undefined,
  enabled = true,
): UpgradeOption {
  return useUpgradeOption((plan) => {
    const row = plan.limits?.find((candidate) => candidate.key === limit);
    if (!row) return false;
    return (
      row.max === null ||
      (currentMax !== null && currentMax !== undefined && row.max > currentMax)
    );
  }, enabled);
}
