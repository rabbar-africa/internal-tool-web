import { Box, Flex, Text } from "@chakra-ui/react";
import { getFollowUpCountdown } from "../utils/followUp";

interface FollowUpBadgeProps {
  date: string | null | undefined;
  /** Renders plain text (no pill) — handy inside dense table cells. */
  plain?: boolean;
}

const DUE_COLOR = "#C1665A";

/**
 * Countdown to a customer's next follow-up. Neutral when upcoming, red once it
 * is due today or overdue, so customer care can see at a glance who to call.
 */
export function FollowUpBadge({ date, plain }: FollowUpBadgeProps) {
  const { label, isDue, isUnset } = getFollowUpCountdown(date);

  if (isUnset) {
    return (
      <Text textStyle="small-regular" color="gray.300">
        Not set
      </Text>
    );
  }

  const color = isDue ? DUE_COLOR : "gray.500";

  if (plain) {
    return (
      <Text textStyle="small-regular" color={color} fontWeight="500">
        {label}
      </Text>
    );
  }

  return (
    <Flex
      align="center"
      gap="1.5"
      px="2.5"
      py="1"
      rounded="full"
      bg={isDue ? `${DUE_COLOR}14` : "gray.75"}
      display="inline-flex"
    >
      <Box w="6px" h="6px" rounded="full" bg={color} flexShrink={0} />
      <Text fontSize="12px" fontWeight="600" color={color}>
        {label}
      </Text>
    </Flex>
  );
}
