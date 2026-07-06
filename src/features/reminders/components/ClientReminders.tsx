import { Button, Center, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/features/overview/components/dashboard/DashboardCard";
import { RouteConstants } from "@/shared/constants/routes";
import type { Reminder } from "@/shared/interface/reminder";
import { useGetRemindersQuery } from "../api/query";
import { ReminderRow } from "./reminder-shared/ReminderRow";
import { useReminderActions } from "./reminder-shared/useReminderActions";

interface ClientRemindersProps {
  clientId: string;
}

/** A client's active reminders — replaces the old follow-up widget. */
export function ClientReminders({ clientId }: ClientRemindersProps) {
  const navigate = useNavigate();
  const { handlers, dialogs } = useReminderActions();

  const { data, isLoading } = useGetRemindersQuery(
    { clientId, status: "PENDING", page: 1, limit: 10 },
    { enabled: Boolean(clientId) },
  );
  const reminders = (data?.data ?? []) as Reminder[];

  const newReminder = (
    <Button
      size="xs"
      variant="outline"
      onClick={() =>
        navigate(`${RouteConstants.reminders.create.path}?clientId=${clientId}`)
      }
    >
      Add reminder
    </Button>
  );

  return (
    <>
      <DashboardCard
        title="Reminders"
        subtitle="Service, follow-ups and paperwork for this customer"
        action={newReminder}
      >
        {isLoading ? (
          <Stack gap="3" mt="1">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} height="44px" rounded="md" />
            ))}
          </Stack>
        ) : reminders.length === 0 ? (
          <Center py="8">
            <Flex direction="column" align="center" gap="2">
              <Text fontSize="13px" color="gray.300">
                No active reminders for this customer.
              </Text>
              <Button
                size="xs"
                variant="ghost"
                onClick={() =>
                  navigate(
                    `${RouteConstants.reminders.create.path}?clientId=${clientId}&type=FOLLOW_UP`,
                  )
                }
              >
                Schedule a follow-up
              </Button>
            </Flex>
          </Center>
        ) : (
          <Stack gap="0" mt="1">
            {reminders.map((reminder, i) => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                isFirst={i === 0}
                handlers={handlers}
                showType
              />
            ))}
          </Stack>
        )}
      </DashboardCard>
      {dialogs}
    </>
  );
}
