import { useEffect } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { SettingsSubPage } from "@/features/settings/components/SettingsSubPage";
import { useBillingOverviewQuery } from "../api/query";
import { BillingCard, CardBody, scrollToPlans } from "./BillingCard";
import { CheckoutReturnBanner } from "./CheckoutReturnBanner";
import { ChoosePlanSection } from "./ChoosePlanSection";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { PaymentHistorySection } from "./PaymentHistorySection";
import { PaymentMethodSection } from "./PaymentMethodSection";

/** Settings → Plan & Billing. Everyone can look; only billing admins act. */
export function BillingSettings() {
  const {
    data: overview,
    isLoading,
    isError,
    refetch,
  } = useBillingOverviewQuery();
  const { has, isLoading: permissionsLoading } = usePermissions();
  const canManage = !permissionsLoading && has("update:organization");

  // "See plans" on a locked page links to `#plans`: go straight there.
  const { hash } = useLocation();
  const loaded = Boolean(overview);
  useEffect(() => {
    if (hash === "#plans" && loaded) {
      const timer = window.setTimeout(scrollToPlans, 150);
      return () => window.clearTimeout(timer);
    }
  }, [hash, loaded]);

  return (
    <SettingsSubPage
      title="Plan & Billing"
      subtitle="Your plan, what you've used, and your payments"
      bare
    >
      <CheckoutReturnBanner />
      {isLoading ? (
        <BillingCard>
          <SectionLoader h="20rem" />
        </BillingCard>
      ) : isError || !overview ? (
        <BillingCard>
          <CardBody>
            <Stack gap="3" align="flex-start">
              <Text fontSize="14px" color="gray.400">
                We couldn't load your plan right now.
              </Text>
              <Button
                variant="outline"
                color="gray.500"
                size="sm"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </Stack>
          </CardBody>
        </BillingCard>
      ) : (
        <Stack gap="5" pb={{ base: "10", md: "16" }}>
          <CurrentPlanSection overview={overview} canManage={canManage} />
          <ChoosePlanSection overview={overview} canManage={canManage} />
          <PaymentMethodSection overview={overview} canManage={canManage} />
          <PaymentHistorySection payments={overview.payments ?? []} />
        </Stack>
      )}
    </SettingsSubPage>
  );
}
