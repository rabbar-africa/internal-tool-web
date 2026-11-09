import { Center, type BoxProps } from "@chakra-ui/react";
import type { RecurringStatus } from "@/shared/interface/recurring-expense";
import {
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
} from "../utils/recurring";

export function RecurringStatusBadge({
  status,
  ...props
}: { status: RecurringStatus } & BoxProps) {
  const colors =
    RECURRING_STATUS_COLORS[status] ?? RECURRING_STATUS_COLORS.STOPPED;
  return (
    <Center
      bg={colors.bg}
      color={colors.color}
      rounded="full"
      h="1.75rem"
      px="3"
      minW="5rem"
      w="fit-content"
      fontWeight={600}
      fontSize=".6875rem"
      whiteSpace="nowrap"
      {...props}
    >
      {RECURRING_STATUS_LABELS[status] ?? status}
    </Center>
  );
}
