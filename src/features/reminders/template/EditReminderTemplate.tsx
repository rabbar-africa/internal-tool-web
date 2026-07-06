import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateReminderPayload } from "@/shared/interface/reminder";
import {
  useGetReminderByIdQuery,
  useUpdateReminderMutation,
} from "../api/query";
import { ReminderForm } from "../components/ReminderForm";

export function EditReminderTemplate() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  const { data, isLoading } = useGetReminderByIdQuery(id);
  const { mutateAsync: updateReminder, isPending } =
    useUpdateReminderMutation();

  const reminder = data?.data;
  const backPath = RouteConstants.reminders.base.path;

  const handleSubmit = async (payload: CreateReminderPayload) => {
    await updateReminder({ id, payload });
    navigate(backPath);
  };

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  if (!reminder) {
    return (
      <Center py="20">
        <Text color="red.500">Reminder not found.</Text>
      </Center>
    );
  }

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
            Edit Reminder
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Update the details of this reminder
          </Text>
        </Box>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
          Cancel
        </Button>
      </Flex>

      <ReminderForm
        reminder={reminder}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backPath)}
      />
    </Stack>
  );
}
