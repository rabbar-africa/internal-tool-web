import { useMemo } from "react";
import { useBillingOverviewQuery } from "../api/query";
import type { PlanFeature, PlanLimit } from "../api/types";
import { HIGHEST_PLAN_TIER } from "../utils/tiers";

/**
 * What this org's plan includes, from `GET /subscriptions/me`. Never hardcode
 * a plan's contents: a super admin can change them without a deploy.
 *
 * Errs towards allowing, like the API: while the plan is unknown nothing is
 * locked, so a paying customer is never blocked by a hiccup, and the API still
 * has the final say with a 402.
 */
export function usePlanAccess() {
  const { data: overview } = useBillingOverviewQuery();

  return useMemo(() => {
    const features = overview?.features;
    const limits = overview?.limits;

    const usageOf = (limit: PlanLimit) => limits?.[limit];

    return {
      hasFeature: (feature: PlanFeature) =>
        !features || features.includes(feature),
      usageOf,
      /** What exists is never touched; this only stops adding more. */
      isAtLimit: (limit: PlanLimit) => usageOf(limit)?.remaining === 0,
      /** The plan they actually get; undefined while it's unknown. */
      tier: overview?.effectiveTier,
      isOnFreePlan: overview?.effectiveTier === "STARTER",
      /**
       * There's a higher plan to sell. Whether it would help with a given lock
       * is for useFeatureUpgrade / useLimitUpgrade. False while the plan is
       * unknown, so nobody is shown an upgrade prompt while it loads.
       */
      canUpgrade:
        overview !== undefined && overview.effectiveTier !== HIGHEST_PLAN_TIER,
    };
  }, [overview]);
}
