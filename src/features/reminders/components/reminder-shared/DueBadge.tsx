import { Box, Text } from "@chakra-ui/react";
import { getDueBadgeMeta } from "../../utils/reminder";

interface DueBadgeProps {
  /** Days until due; negative = overdue. */
  days: number;
  plain?: boolean;
}

/** Red/amber/green pill communicating how soon a reminder is due. */
export function DueBadge({ days, plain }: DueBadgeProps) {
  const meta = getDueBadgeMeta(days);

  if (plain) {
    return (
      <Text fontSize="12px" fontWeight="600" color={meta.color}>
        {meta.label}
      </Text>
    );
  }

  return (
    <Box
      display="inline-flex"
      bg={meta.bg}
      px="10px"
      py="4px"
      rounded="md"
      alignItems="center"
    >
      <Text fontSize="12px" fontWeight="500" color={meta.color}>
        {meta.label}
      </Text>
    </Box>
  );
}
