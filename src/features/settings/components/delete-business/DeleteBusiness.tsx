import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import { ExportDataButton } from "@/features/exports/components";
import {
  useBusinessDeletionStatusQuery,
  useCancelBusinessDeletionMutation,
  useGetOrganizationDetails,
} from "../../api/query";
import { SettingsSubPage } from "../SettingsSubPage";
import { DeleteBusinessDialog } from "./DeleteBusinessDialog";
import { deletionNotice, formatDeletionDate } from "./copy";

/** Settings › Delete business: the owner deleting their own business. */
export function DeleteBusiness() {
  const { data, isLoading } = useBusinessDeletionStatusQuery();
  const { data: orgData } = useGetOrganizationDetails();
  const { mutate: cancelDeletion, isPending: isCancelling } =
    useCancelBusinessDeletionMutation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const status = data?.data;
  const businessName = orgData?.data?.name ?? "";

  return (
    <SettingsSubPage
      title="Delete Business"
      subtitle="Remove your business and all its data from Rabbar"
    >
      {isLoading || !status ? (
        <SectionLoader />
      ) : (
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="error.75"
          rounded="xl"
          p={{ base: "4", md: "6" }}
          maxW="44rem"
        >
          {status.scheduled ? (
            <Stack gap="4">
              <Text textStyle="default-bold" color="error.300">
                This business will be deleted on{" "}
                {formatDeletionDate(status.scheduled.scheduledFor)}
              </Text>
              <Text textStyle="small-regular" color="gray.400">
                Requested by {status.scheduled.requestedBy} on{" "}
                {formatDeletionDate(status.scheduled.requestedAt)}. Until then
                everything works as normal. Export what you want to keep before
                that date. Automatic renewal is paused, so your card won&rsquo;t
                be charged.
              </Text>
              <Flex gap="4" align="center" wrap="wrap">
                {status.canRequest && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={isCancelling}
                    onClick={() => cancelDeletion()}
                  >
                    Cancel deletion
                  </Button>
                )}
                <ExportDataButton fontSize="sm" />
              </Flex>
            </Stack>
          ) : status.canRequest ? (
            <Stack gap="4">
              <Text textStyle="small-regular" color="gray.400">
                {deletionNotice(status.graceDays)}
              </Text>
              <Text textStyle="small-regular" color="gray.400">
                Automatic renewal is paused during those {status.graceDays}{" "}
                days, so your card won&rsquo;t be charged.
              </Text>
              <Flex gap="4" align="center" wrap="wrap">
                <Button
                  size="sm"
                  bg="error.300"
                  color="white"
                  _hover={{ bg: "error.400" }}
                  disabled={!businessName}
                  onClick={() => setDialogOpen(true)}
                >
                  Delete business
                </Button>
                <ExportDataButton fontSize="sm" />
              </Flex>
            </Stack>
          ) : (
            <Text textStyle="small-regular" color="gray.400">
              Only the business owner can delete the business.
            </Text>
          )}
        </Box>
      )}

      {dialogOpen && (
        <DeleteBusinessDialog
          businessName={businessName}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </SettingsSubPage>
  );
}
