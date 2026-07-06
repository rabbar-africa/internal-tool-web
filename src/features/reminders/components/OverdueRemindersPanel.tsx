import { Center, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DashboardCard } from "@/features/overview/components/dashboard/DashboardCard";
import type { Reminder } from "@/shared/interface/reminder";
import { useGetRemindersQuery } from "../api/query";
import { ReminderRow } from "./reminder-shared/ReminderRow";
import type { ReminderActionHandlers } from "./reminder-shared/useReminderActions";

interface OverdueRemindersPanelProps {
  type?: string;
  limit?: number;
  handlers?: ReminderActionHandlers;
  showType?: boolean;
}

/** Pending reminders already past their due date, soonest-overdue first. */
export function OverdueRemindersPanel({
  type,
  limit = 8,
  handlers,
  showType,
}: OverdueRemindersPanelProps) {
  const { data, isLoading } = useGetRemindersQuery({
    status: "PENDING",
    overdue: true,
    ...(type ? { type } : {}),
    page: 1,
    limit,
  });
  const reminders = (data?.data ?? []) as Reminder[];
  const total = data?.meta?.total ?? reminders.length;

  return (
    <DashboardCard
      title="Overdue"
      subtitle={
        total > 0 ? `${total} past due` : "Nothing past due — all caught up"
      }
    >
      {isLoading ? (
        <Stack gap="3" mt="1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="44px" rounded="md" />
          ))}
        </Stack>
      ) : reminders.length === 0 ? (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No overdue reminders
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
