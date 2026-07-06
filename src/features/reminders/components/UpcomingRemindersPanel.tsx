import { Center, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/features/overview/components/dashboard/DashboardCard";
import { RouteConstants } from "@/shared/constants/routes";
import type { Reminder } from "@/shared/interface/reminder";
import { useGetUpcomingRemindersQuery } from "../api/query";
import { ReminderRow } from "./reminder-shared/ReminderRow";
import type { ReminderActionHandlers } from "./reminder-shared/useReminderActions";

interface UpcomingRemindersPanelProps {
  title: string;
  subtitle?: string;
  type?: string;
  withinDays?: number;
  limit?: number;
  includeOverdue?: boolean;
  emptyText?: string;
  /** When set, rows expose the 3-dot action menu. */
  handlers?: ReminderActionHandlers;
  /** When set, shows a "View all" link to the reminders list (filtered). */
  showViewAll?: boolean;
  /** Show the reminder type caption on each row (for mixed-type panels). */
  showType?: boolean;
}

/**
 * "Next N due within a horizon" panel backed by GET /reminders/upcoming.
 * Reused on the reminders dashboard and the overview dashboard.
 */
export function UpcomingRemindersPanel({
  title,
  subtitle,
  type,
  withinDays = 30,
  limit = 5,
  includeOverdue = true,
  emptyText = "Nothing due soon",
  handlers,
  showViewAll,
  showType,
}: UpcomingRemindersPanelProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingRemindersQuery({
    type,
    withinDays,
    limit,
    includeOverdue,
  });
  const reminders = (data?.data ?? []) as Reminder[];

  const viewAll = showViewAll ? (
    <Text
      as="button"
      fontSize="12px"
      fontWeight="500"
      color="primary.500"
      _hover={{ textDecoration: "underline" }}
      onClick={() =>
        navigate(
          type
            ? `${RouteConstants.reminders.base.path}?type=${type}`
            : RouteConstants.reminders.base.path,
        )
      }
    >
      View all
    </Text>
  ) : undefined;

  return (
    <DashboardCard title={title} subtitle={subtitle} action={viewAll}>
      {isLoading ? (
        <Stack gap="3" mt="1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="44px" rounded="md" />
          ))}
        </Stack>
      ) : reminders.length === 0 ? (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            {emptyText}
          </Text>
        </Center>
      ) : (
        <Stack gap="0" mt="1">
          {reminders.map((reminder, i) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              isFirst={i === 0}
              handlers={handlers}
              showType={showType}
            />
          ))}
        </Stack>
      )}
    </DashboardCard>
  );
}
