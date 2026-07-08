import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { RouteConstants } from "@/shared/constants/routes";
import type { JobCardFormPayload } from "@/shared/interface/job-card";
import { useGetJobCardByIdQuery, useUpdateJobCardMutation } from "../api/query";
import { JobCardForm } from "../components/job-card-form/JobCardForm";

export function EditJobCardTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetJobCardByIdQuery(id ?? "");
  const { mutateAsync: updateJobCard, isPending } = useUpdateJobCardMutation();

  const jobCard = data?.data;

  if (isLoading) return <SectionLoader />;
  if (!jobCard) {
    return <Text color="gray.400">Job card not found.</Text>;
  }

  const detailPath = RouteConstants.jobCards.detail.generate({
    id: jobCard.id,
  });

  const handleSubmit = async (payload: JobCardFormPayload) => {
    // The form never sets technicianIds in edit mode (PUT rejects it).
    await updateJobCard({ id: jobCard.id, payload });
    navigate(detailPath);
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
            Edit {jobCard.jobNumber}
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Update the job card details
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(detailPath)}
        >
          Cancel
        </Button>
      </Flex>

      <JobCardForm
        jobCard={jobCard}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(detailPath)}
      />
    </Stack>
  );
}
