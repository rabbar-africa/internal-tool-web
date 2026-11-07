import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { WarningCircle } from "@/assets/custom/WarningCircle";
import { UserDashboardContainer } from "@/components/hoc";
import { ExportDataButton } from "@/features/exports/components";
import {
  useBusinessDeletionStatusQuery,
  useCancelBusinessDeletionMutation,
} from "../../api/query";
import { formatDeletionDate } from "./copy";

/**
 * On every page, for everyone in the business, while its deletion is
 * scheduled: so nobody is surprised, and there's time to export.
 */
export function BusinessDeletionBanner() {
  const { data } = useBusinessDeletionStatusQuery();
  const { mutate: cancelDeletion, isPending } =
    useCancelBusinessDeletionMutation();

  const status = data?.data;
  if (!status?.scheduled) return null;

  return (
    <Box
      as="section"
      role="status"
      aria-live="polite"
      bg="error.50"
      borderBottomWidth="1px"
      borderColor="error.75"
      py="3"
      flexShrink={0}
    >
      <UserDashboardContainer>
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          gap={{ base: "3", md: "5" }}
        >
          <Flex gap="3" align="flex-start" flex="1" minW={0}>
            <WarningCircle
              boxSize="1.25rem"
              color="error.300"
              mt="0.125rem"
              flexShrink={0}
              aria-hidden="true"
            />
            <Box>
              <Text fontSize="0.9375rem" fontWeight="600" color="gray.500">
                This business will be deleted on{" "}
                {formatDeletionDate(status.scheduled.scheduledFor)}.
              </Text>
              <Text fontSize="0.8125rem" color="gray.400" mt="0.5">
                Export your data before then.{" "}
                <ExportDataButton fontSize="inherit">
                  Export now
                </ExportDataButton>
              </Text>
            </Box>
          </Flex>

          {status.canRequest && (
            <Button
              size="sm"
              variant="outline"
              bg="white"
              flexShrink={0}
              loading={isPending}
              onClick={() => cancelDeletion()}
            >
              Cancel deletion
            </Button>
          )}
        </Flex>
      </UserDashboardContainer>
    </Box>
  );
}
