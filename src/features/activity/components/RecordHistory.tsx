import { Box, Flex, Text } from "@chakra-ui/react";
import { usePermissions } from "@/hooks/usePermissions";
import type { ActivityEntityType } from "@/shared/interface/activity";
import { useActivityQuery } from "../api/query";
import { ActivityFeed } from "./ActivityFeed";

interface RecordHistoryProps {
  /** The record: its own entries, and others that name it (its payments…). */
  entityId: string;
  entityType?: ActivityEntityType;
}

/**
 * Who did what to this record. Shown only to people who may read the
 * activity log; for everyone else it is not there at all.
 */
export function RecordHistory({ entityId }: RecordHistoryProps) {
  const { canAccess } = usePermissions();
  const allowed = canAccess("activityLog");
  const query = useActivityQuery(
    { entityId, limit: 10 },
    { enabled: allowed && Boolean(entityId) },
  );
  if (!allowed) return null;

  const pages = query.data?.pages ?? [];
  const entries = pages.flatMap((p) => p.items);
  const limited = pages[0]?.history.limitedToDays;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
      data-testid="record-history"
    >
      <Flex
        justify="space-between"
        align="center"
        px={{ base: "4", md: "5" }}
        py="3"
        borderBottomWidth="1px"
        borderColor="gray.75"
        bg="gray.25"
      >
        <Text textStyle="small-semibold" color="gray.500">
          History
        </Text>
        {limited ? (
          <Text fontSize="12px" color="gray.300">
            Last {limited} days
          </Text>
        ) : null}
      </Flex>
      <Box px={{ base: "4", md: "5" }} pb="2">
        <ActivityFeed
          compact
          entries={entries}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          hasMore={Boolean(query.hasNextPage)}
          isLoadingMore={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
          emptyText="Nothing recorded for this yet. Changes from now on will show here."
        />
      </Box>
    </Box>
  );
}
