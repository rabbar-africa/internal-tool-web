import { Stack, Text } from "@chakra-ui/react";
import type { ICustomer } from "@/shared/interface/customer";
import { FollowUpBadge } from "../FollowUpBadge";

interface CustomerFollowUpProps {
  customer: ICustomer;
}

/**
 * Read-only follow-up summary shown in the customer header. Editing/removing the
 * follow-up lives in the customer actions menu (see CustomerActionsMenu).
 */
export function CustomerFollowUp({ customer }: CustomerFollowUpProps) {
  return (
    <Stack gap="1.5" align={{ base: "flex-start", md: "flex-end" }}>
      <Text
        fontSize="11px"
        color="gray.300"
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        Next follow-up
      </Text>

      <FollowUpBadge date={customer.followUpDate} />

      {customer.followUpNote && (
        <Text fontSize="11px" color="gray.300" maxW="220px" truncate>
          {customer.followUpNote}
        </Text>
      )}
    </Stack>
  );
}
