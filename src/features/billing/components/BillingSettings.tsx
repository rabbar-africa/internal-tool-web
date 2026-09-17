import { Button, Separator, Stack, Text } from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { SettingsSubPage } from "@/features/settings/components/SettingsSubPage";
import { useBillingOverviewQuery } from "../api/query";
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

  return (
    <SettingsSubPage
      title="Plan & Billing"
      subtitle="Your plan, how you pay, and your payment history"
    >
      {isLoading ? (
        <SectionLoader h="20rem" />
      ) : isError || !overview ? (
        <Stack gap="3" align="flex-start">
          <Text fontSize="14px" color="gray.400">
            We couldn't load your plan right now.
          </Text>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : (
        <Stack gap="8" separator={<Separator borderColor="gray.75" />}>
          <CurrentPlanSection overview={overview} canManage={canManage} />
          <PaymentMethodSection overview={overview} canManage={canManage} />
          <ChoosePlanSection overview={overview} canManage={canManage} />
          <PaymentHistorySection payments={overview.payments ?? []} />
        </Stack>
      )}
    </SettingsSubPage>
  );
}
