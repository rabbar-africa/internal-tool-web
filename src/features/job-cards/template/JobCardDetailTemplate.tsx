import { useState } from "react";
import { Box, Button, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import SectionLoader from "@/components/common/SectionLoader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSelect } from "@/components/input/CustomSelect";
import { RouteConstants } from "@/shared/constants/routes";
import {
  JOB_CARD_STATUS_LABELS,
  JOB_CARD_STATUS_OPTIONS,
  type JobCardStatus,
} from "@/shared/interface/job-card";
import {
  useDeleteJobCardMutation,
  useGetJobCardByIdQuery,
  useUpdateJobCardStatusMutation,
} from "../api/query";
import {
  JobCardPriorityBadge,
  JobCardStatusBadge,
} from "../components/job-card-list/columns";
import { JobCardFinancialsCards } from "../components/job-card-detail/JobCardFinancialsCards";
import { JobCardInfo } from "../components/job-card-detail/JobCardInfo";
import { JobCardTechnicians } from "../components/job-card-detail/JobCardTechnicians";
import { JobCardTabs } from "../components/job-card-detail/JobCardTabs";

export function JobCardDetailTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<JobCardStatus | null>(
    null,
  );

  const { data, isLoading } = useGetJobCardByIdQuery(id ?? "");
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } =
    useUpdateJobCardStatusMutation();
  const { mutateAsync: deleteJobCard, isPending: isDeleting } =
    useDeleteJobCardMutation();

  const jobCard = data?.data;

  if (isLoading) return <SectionLoader />;
  if (!jobCard) {
    return <Text color="gray.400">Job card not found.</Text>;
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    await updateStatus({ id: jobCard.id, status: pendingStatus });
    setPendingStatus(null);
  };

  const handleDelete = async () => {
    await deleteJobCard(jobCard.id);
    navigate(RouteConstants.jobCards.base.path);
  };

  return (
    <>
      <Stack gap="5">
        <CustomBreadCrumb
          items={[
            { label: "Job Cards", to: RouteConstants.jobCards.base.path },
            { label: jobCard.jobNumber, isCurrent: true },
          ]}
        />

        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap="3"
        >
          <Box>
            <HStack gap="3" wrap="wrap">
              <Text textStyle="h3-bold" color="gray.500">
                {jobCard.jobNumber}
              </Text>
              <JobCardStatusBadge status={jobCard.status} />
              <JobCardPriorityBadge priority={jobCard.priority} />
            </HStack>
            {jobCard.complaint && (
              <Text textStyle="small-regular" color="gray.300" mt="1">
                {jobCard.complaint}
              </Text>
            )}
          </Box>

          <Flex gap="2" align="center" wrap="wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(
                  RouteConstants.jobCards.edit.generate({ id: jobCard.id }),
                )
              }
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              color="error.300"
              borderColor="error.300"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Flex>
        </Flex>
        <CustomSelect
          placeholder="Change status..."
          options={JOB_CARD_STATUS_OPTIONS}
          disabled={isUpdatingStatus}
          value={[jobCard.status]}
          onChange={(opt: { value: string[] }) => {
            const status = opt?.value?.[0] as JobCardStatus | undefined;
            if (status && status !== jobCard.status) setPendingStatus(status);
          }}
          rootProps={{ size: "sm", w: "auto" }}
          controlProps={{ w: "185px" }}
        />
        <JobCardFinancialsCards financials={jobCard.financials} />

        <JobCardInfo jobCard={jobCard} />

        <Stack gap="5" align="stretch">
          <Box flex="2" minW={0}>
            <JobCardTabs jobCard={jobCard} />
          </Box>
          <Box flex="1" minW={0}>
            <JobCardTechnicians jobCard={jobCard} />
          </Box>
        </Stack>
      </Stack>

      <ConsentDialog
        open={Boolean(pendingStatus)}
        onOpenChange={({ open }) => {
          if (!open) setPendingStatus(null);
        }}
        variant="info"
        heading={`Move ${jobCard.jobNumber} to ${
          pendingStatus ? JOB_CARD_STATUS_LABELS[pendingStatus] : ""
        }?`}
        note={
          pendingStatus === "DELIVERED" || pendingStatus === "CANCELLED"
            ? "This closes the job card — the closed date will be set automatically."
            : `Status will change from ${JOB_CARD_STATUS_LABELS[jobCard.status]}.`
        }
        confirmText="Yes, Update"
        handleSubmit={confirmStatusChange}
        isLoading={isUpdatingStatus}
      />

      <ConsentDialog
        open={deleteOpen}
        onOpenChange={({ open }) => setDeleteOpen(open)}
        heading={`Delete job card ${jobCard.jobNumber}?`}
        note="Linked invoices, inspections and payments will be unlinked, not deleted."
        handleSubmit={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
