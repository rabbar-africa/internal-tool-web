import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import type { IActivityEntry } from "@/shared/interface/activity";
import {
  SOURCE_LABELS,
  actionVerb,
  describeChange,
  entityHref,
  isDestructive,
  linkFor,
} from "./activity-labels";

function Entry({
  entry,
  compact,
}: {
  entry: IActivityEntry;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const href = linkFor(entry);
  const changes = entry.changes ?? [];
  const related = (entry.related ?? []).filter(
    (r) => r.label && r.type !== "customer",
  );
  const who = entry.actor.name ?? "Someone";

  return (
    <Stack gap="1" py="3" data-testid="activity-entry">
      <Flex justify="space-between" gap="3" align="flex-start">
        <Stack gap="1" minW={0}>
          <Flex gap="2" align="center" wrap="wrap">
            <Badge
              size="sm"
              colorPalette={isDestructive(entry.action) ? "red" : "gray"}
              variant="subtle"
            >
              {actionVerb(entry.action)}
            </Badge>
            {!compact && entry.entityLabel && (
              <>
                {href ? (
                  <Link
                    asChild
                    fontSize="13px"
                    fontWeight="600"
                    color="primary.400"
                  >
                    <RouterLink to={href}>{entry.entityLabel}</RouterLink>
                  </Link>
                ) : (
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    {entry.entityLabel}
                  </Text>
                )}
              </>
            )}
          </Flex>
          <Text fontSize="13px" color="gray.500">
            {entry.summary}
          </Text>
          <Text fontSize="12px" color="gray.300">
            {who}
            {entry.actor.role
              ? ` (${entry.actor.role.replace(/_/g, " ")})`
              : ""}
            {" · "}
            {SOURCE_LABELS[entry.source] ?? entry.source}
          </Text>
        </Stack>
        <Text
          fontSize="12px"
          color="gray.300"
          flexShrink={0}
          title={moment(entry.occurredAt).format("DD MMM YYYY, h:mm:ss a")}
        >
          {moment(entry.occurredAt).format(
            compact ? "DD MMM, h:mm a" : "DD MMM YYYY, h:mm a",
          )}
        </Text>
      </Flex>

      {(changes.length > 0 || related.length > 0) && (
        <Box>
          <Button
            variant={"ghost"}
            size="2xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide details" : "Details"}
          </Button>
          {open && (
            <Stack
              gap="1"
              mt="1"
              pl="3"
              borderLeftWidth="2px"
              borderColor="gray.75"
            >
              {changes.map((c) => (
                <Text key={c.field} fontSize="12px" color="gray.400">
                  {describeChange(c)}
                </Text>
              ))}
              {related.length > 0 && (
                <Text fontSize="12px" color="gray.400">
                  Also about:{" "}
                  {related.map((r, i) => {
                    const to = entityHref(r.type, r.id);
                    return (
                      <span key={`${r.type}:${r.id}`}>
                        {i > 0 ? ", " : ""}
                        {to ? (
                          <Link asChild color="primary.400">
                            <RouterLink to={to}>{r.label}</RouterLink>
                          </Link>
                        ) : (
                          r.label
                        )}
                      </span>
                    );
                  })}
                </Text>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  );
}

interface ActivityFeedProps {
  entries: IActivityEntry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** On a record's own page: its number is already the page's title. */
  compact?: boolean;
  emptyText?: string;
}

export function ActivityFeed({
  entries,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  compact,
  emptyText = "Nothing recorded yet.",
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Center py="6">
        <Spinner size="sm" color="gray.300" />
      </Center>
    );
  }
  if (isError) {
    return (
      <Flex align="center" justify="space-between" gap="3" py="3">
        <Text fontSize="13px" color="error.300">
          We couldn't load the activity.
        </Text>
        <Button size="xs" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </Flex>
    );
  }
  if (!entries.length) {
    return (
      <Text fontSize="13px" color="gray.300" py="4">
        {emptyText}
      </Text>
    );
  }
  return (
    <Stack gap="0">
      {entries.map((entry, i) => (
        <Box
          key={entry.id}
          borderTopWidth={i === 0 ? "0" : "1px"}
          borderColor="gray.50"
        >
          <Entry entry={entry} compact={compact} />
        </Box>
      ))}
      {hasMore && (
        <Center pt="3">
          <Button
            size="xs"
            variant="outline"
            onClick={onLoadMore}
            loading={isLoadingMore}
          >
            Load more
          </Button>
        </Center>
      )}
    </Stack>
  );
}
