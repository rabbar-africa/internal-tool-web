import { Box, Flex, Text } from "@chakra-ui/react";
import { WarningCircle } from "@/assets/custom/WarningCircle";
import { UserDashboardContainer } from "@/components/hoc";
import { usePermissions } from "@/hooks/usePermissions";
import { useBillingOverviewQuery } from "../api/query";
import {
  ASK_ADMIN_NOTE,
  PAYMENT_OPTIONS_NOTE,
  TONE_STYLES,
  describeDue,
} from "../utils/copy";
import { PayNowButton } from "./PayNowButton";

/**
 * App-wide "your plan is due" strip, shown under the nav bar. Hidden when a
 * saved card will be charged automatically — there is nothing to do then.
 */
export function BillingBanner() {
  const { data: overview } = useBillingOverviewQuery();
  const { has, isLoading } = usePermissions();

  const due = overview ? describeDue(overview) : null;
  if (!overview || !due || overview.billing.autoCharge) return null;

  const canPay = !isLoading && has("update:organization");
  const tone = TONE_STYLES[due.tone];
  const { promoDescription, renewalPlanTier } = overview.billing;

  return (
    <Box
      as="section"
      role="status"
      aria-live="polite"
      bg={tone.bg}
      borderBottomWidth="1px"
      borderColor={tone.border}
      py="3"
      flexShrink={0}
    >
      <UserDashboardContainer>
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          gap={{ base: "3", md: "5" }}
        >
          <Flex gap="3" align="flex-start" flex="1" minW={0}>
            <WarningCircle
              boxSize="1.25rem"
              color={tone.color}
              mt="0.125rem"
              flexShrink={0}
              aria-hidden="true"
            />
            <Box>
              <Text fontSize="0.9375rem" fontWeight="600" color="gray.500">
                {due.message}
              </Text>
              <Text fontSize="0.8125rem" color="gray.400" mt="0.5">
                {canPay ? PAYMENT_OPTIONS_NOTE : ASK_ADMIN_NOTE}
                {promoDescription
                  ? ` Includes your promo: ${promoDescription}.`
                  : ""}
              </Text>
            </Box>
          </Flex>

          {canPay && (
            <PayNowButton
              planTier={renewalPlanTier}
              flexShrink={0}
              w={{ base: "full", md: "auto" }}
              px="2rem"
            >
              Pay now
            </PayNowButton>
          )}
        </Flex>
      </UserDashboardContainer>
    </Box>
  );
}
