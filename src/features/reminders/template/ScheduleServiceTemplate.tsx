import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateReminderPayload } from "@/shared/interface/reminder";
import { useCreateReminderMutation } from "../api/query";
import { ReminderForm } from "../components/ReminderForm";

export function ScheduleServiceTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") ?? "";
  const vehicleId = searchParams.get("vehicleId") ?? "";

  const { mutateAsync: createReminder, isPending } =
    useCreateReminderMutation();

  const backPath = clientId
    ? RouteConstants.customers.detail.generate({ id: clientId })
    : RouteConstants.reminders.base.path;

  const handleSubmit = async (payload: CreateReminderPayload) => {
    // Force the SERVICE type regardless of any stray form state.
    await createReminder({ ...payload, type: "SERVICE" });
    navigate(backPath);
  };

  return (
    <Stack gap="6">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="h3-bold" color="gray.500">
            Schedule Service
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Set up a recurring service reminder — completing it schedules the
            next one automatically
          </Text>
        </Box>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
          Cancel
        </Button>
      </Flex>

      <ReminderForm
        lockType
        submitLabel="Schedule Service"
        defaults={{
          type: "SERVICE",
          title: "Service",
          clientId: clientId || undefined,
          vehicleId: vehicleId || undefined,
        }}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backPath)}
      />
    </Stack>
  );
}
