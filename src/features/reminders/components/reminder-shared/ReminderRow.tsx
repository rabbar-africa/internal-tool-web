import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import type { Reminder } from "@/shared/interface/reminder";
import { reminderTypeLabel } from "@/shared/interface/reminder";
import {
  formatDueDate,
  getDueInDays,
  reminderVehicleLabel,
} from "../../utils/reminder";
import { DueBadge } from "./DueBadge";
import { ReminderRowActions } from "./ReminderRowActions";
import type { ReminderActionHandlers } from "./useReminderActions";

interface ReminderRowProps {
  reminder: Reminder;
  isFirst?: boolean;
  /** When set, renders the 3-dot actions menu on the right. */
  handlers?: ReminderActionHandlers;
  /** When set, the row becomes clickable (e.g. to open edit). */
  onClick?: (reminder: Reminder) => void;
  /** Show the type as a small caption under the title (used on mixed lists). */
  showType?: boolean;
}

/** One reminder line — title, who/what it's for, and how soon it's due. */
export function ReminderRow({
  reminder,
  isFirst,
  handlers,
  onClick,
  showType,
}: ReminderRowProps) {
  const days = getDueInDays(reminder);
  const vehicle = reminderVehicleLabel(reminder);
  const client = reminder.client?.displayName;
  const subParts = [client, vehicle].filter(Boolean);

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="3"
      py="3"
      borderTopWidth={isFirst ? "0" : "1px"}
      borderColor="gray.75"
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? { bg: "gray.50/60" } : undefined}
      role={onClick ? "button" : undefined}
      onClick={onClick ? () => onClick(reminder) : undefined}
    >
      <Box minW="0" flex="1">
        <Text fontSize="13px" fontWeight="600" color="gray.500" lineClamp={1}>
          {reminder.title}
        </Text>
        <Text fontSize="12px" color="gray.300" lineClamp={1}>
          {showType && (
            <Text as="span" color="gray.400" fontWeight="500">
              {reminderTypeLabel(reminder.type)}
            </Text>
          )}
          {showType && subParts.length > 0 ? " · " : ""}
          {subParts.join(" · ") || (!showType ? "—" : "")}
        </Text>
      </Box>

      <Flex align="center" gap="3" flexShrink="0">
        <Stack gap="0.5" align="flex-end">
          <DueBadge days={days} plain />
          <Text fontSize="11px" color="gray.300">
            {formatDueDate(reminder.dueDate)}
          </Text>
        </Stack>
        {handlers && (
          <ReminderRowActions reminder={reminder} handlers={handlers} />
        )}
      </Flex>
    </Flex>
  );
}
