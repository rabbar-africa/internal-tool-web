import { Box, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import { useBillingOverviewQuery } from "../api/query";
import { usePlanAccess } from "../hooks/usePlanAccess";

const count = (n: number) => n.toLocaleString("en-NG");

/**
 * On the free Starter plan only: how many invoices are left, at the foot of
 * the sidebar, with "Upgrade" for whoever can change the plan. Opens Plan &
 * Billing. Shares the overview the route guard already loads, so it costs no
 * request. A paid plan shows nothing here.
 */
export function SidebarPlanCard({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { data: overview } = useBillingOverviewQuery();
  const { canAccess } = usePermissions();
  const { canUpgrade, isOnFreePlan } = usePlanAccess();
  if (!overview || !isOnFreePlan) return null;

  const canOpen = canAccess("billing");
  const invoices = overview.limits?.invoices;
  const limit = invoices?.limit ?? null;
  const percent =
    invoices && limit ? Math.min(100, (invoices.used / limit) * 100) : 0;
  const full = Boolean(invoices && limit !== null && invoices.used >= limit);
  const open = () => {
    navigate(RouteConstants.settings.billing.path);
    onNavigate?.();
  };

  return (
    <Box
      as={canOpen ? "button" : "div"}
      onClick={canOpen ? open : undefined}
      textAlign="left"
      w="calc(100% - 16px)"
      mx="2"
      mt="2"
      mb="2"
      flexShrink={0}
      px="3"
      py="2.5"
      rounded="lg"
      bg="rgba(255,255,255,0.06)"
      borderWidth="1px"
      borderColor="rgba(255,255,255,0.1)"
      cursor={canOpen ? "pointer" : "default"}
      _hover={canOpen ? { bg: "rgba(255,255,255,0.1)" } : undefined}
    >
      <Flex justify="space-between" align="center" gap="2">
        <Text fontSize="13px" fontWeight="600" color="white" truncate>
          {overview.plan.name}
        </Text>
        {canOpen && canUpgrade && (
          <Text fontSize="12px" fontWeight="600" color="secondary.300">
            Upgrade
          </Text>
        )}
      </Flex>
      {invoices && (
        <>
          <Text fontSize="11px" color="rgba(255,255,255,0.68)" mt="0.5">
            {limit === null
              ? `${count(invoices.used)} invoices, no limit`
              : `${count(invoices.used)} of ${count(limit)} invoices${
                  invoices.per === "total" ? "" : ` this ${invoices.per}`
                }`}
          </Text>
          {limit !== null && (
            <Box
              h="4px"
              mt="1.5"
              rounded="full"
              bg="rgba(255,255,255,0.15)"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={`${percent}%`}
                minW={percent > 0 ? "4px" : 0}
                rounded="full"
                bg={full ? "error.100" : "secondary.300"}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
