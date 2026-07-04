import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateJobCardPayload } from "@/shared/interface/job-card";
import { useCreateJobCardMutation } from "../api/query";
import { JobCardForm } from "../components/job-card-form/JobCardForm";

export function CreateJobCardTemplate() {
  const navigate = useNavigate();
  const { mutateAsync: createJobCard, isPending } = useCreateJobCardMutation();

  const handleSubmit = async (payload: CreateJobCardPayload) => {
    const created = await createJobCard(payload);
    const id = created?.data?.id;
    navigate(
      id
        ? RouteConstants.jobCards.detail.generate({ id })
        : RouteConstants.jobCards.base.path,
    );
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
            New Job Card
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Register an incoming job — the job number is assigned automatically
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(RouteConstants.jobCards.base.path)}
        >
          Cancel
        </Button>
      </Flex>

      <JobCardForm
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(RouteConstants.jobCards.base.path)}
      />
    </Stack>
  );
}
