import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  CreateReminderPayload,
  ReminderType,
} from "@/shared/interface/reminder";
import { useCreateReminderMutation } from "../api/query";
import { ReminderForm } from "../components/ReminderForm";

export function CreateReminderTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Prefill when arriving from a client page (or elsewhere).
  const clientId = searchParams.get("clientId") ?? "";
  const vehicleId = searchParams.get("vehicleId") ?? "";
  const type = (searchParams.get("type") ?? "") as ReminderType;

  const { mutateAsync: createReminder, isPending } =
    useCreateReminderMutation();

  const backPath = clientId
    ? RouteConstants.customers.detail.generate({ id: clientId })
    : RouteConstants.reminders.base.path;

  const handleSubmit = async (payload: CreateReminderPayload) => {
    await createReminder(payload);
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
            New Reminder
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Schedule something coming due
          </Text>
        </Box>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
          Cancel
        </Button>
      </Flex>

      <ReminderForm
        defaults={{
          clientId: clientId || undefined,
          vehicleId: vehicleId || undefined,
          type: type || undefined,
        }}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backPath)}
      />
    </Stack>
  );
}
