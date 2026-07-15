import { useMemo } from "react";
import { Center, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/features/overview/components/dashboard/DashboardCard";
import { RouteConstants } from "@/shared/constants/routes";
import type { Reminder } from "@/shared/interface/reminder";
import { useGetUpcomingRemindersQuery } from "../api/query";
import { ReminderRow } from "./reminder-shared/ReminderRow";
import type { ReminderActionHandlers } from "./reminder-shared/useReminderActions";

/**
 * How many reminders an excluding panel asks for before narrowing client-side.
 * The request is already bounded by `withinDays`, so this is a generous ceiling
 * on "everything due in the horizon" rather than a page size.
 */
const EXCLUDE_FETCH_LIMIT = 50;

interface UpcomingRemindersPanelProps {
  title: string;
  subtitle?: string;
  /** Restrict to a single reminder type. Omit to include every type. */
  type?: string;
  /**
   * Types to leave out of an all-types panel — e.g. one covered by its own
   * panel elsewhere. `/reminders/upcoming` filters by a single type and has no
   * exclude option, so this is applied client-side. Ignored when `type` is set.
   */
  excludeTypes?: string[];
  withinDays?: number;
  limit?: number;
  includeOverdue?: boolean;
  emptyText?: string;
  /** When set, rows expose the 3-dot action menu. */
  handlers?: ReminderActionHandlers;
  /** When set, shows a "View all" link to the reminders list (filtered). */
  showViewAll?: boolean;
  /** Show the reminder type caption on each row (for mixed-type panels). */
  showType?: boolean;
}

/**
 * "Next N due within a horizon" panel backed by GET /reminders/upcoming.
 * Reused on the reminders dashboard and the overview dashboard.
 */
export function UpcomingRemindersPanel({
  title,
  subtitle,
  type,
  excludeTypes,
  withinDays = 30,
  limit = 5,
  includeOverdue = true,
  emptyText = "Nothing due soon",
  handlers,
  showViewAll,
  showType,
}: UpcomingRemindersPanelProps) {
  const navigate = useNavigate();
  const isExcluding = !type && Boolean(excludeTypes?.length);

  const { data, isLoading } = useGetUpcomingRemindersQuery({
    type,
    withinDays,
    // Excluded rows are dropped after they arrive, so ask for the horizon
    // rather than `limit` — otherwise the panel could come back short.
    limit: isExcluding ? EXCLUDE_FETCH_LIMIT : limit,
    includeOverdue,
  });

  // Depend on the contents, not the array identity, so an inline
  // `excludeTypes={[...]}` doesn't recompute every render.
  const excludeKey = excludeTypes?.join(",") ?? "";
  const reminders = useMemo(() => {
    const all = (data?.data ?? []) as Reminder[];
    if (!isExcluding) return all;
    const skip = new Set(
      excludeKey.split(",").map((t) => t.trim().toUpperCase()),
    );
    return all
      .filter((r) => !skip.has(String(r.type).toUpperCase()))
      .slice(0, limit);
  }, [data?.data, isExcluding, excludeKey, limit]);

  const viewAll = showViewAll ? (
    <Text
      as="button"
      fontSize="12px"
      fontWeight="500"
      color="primary.500"
      _hover={{ textDecoration: "underline" }}
      onClick={() =>
        navigate(
          type
            ? `${RouteConstants.reminders.base.path}?type=${type}`
            : RouteConstants.reminders.base.path,
        )
      }
    >
      View all
    </Text>
  ) : undefined;

  return (
    <DashboardCard title={title} subtitle={subtitle} action={viewAll}>
      {isLoading ? (
        <Stack gap="3" mt="1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="44px" rounded="md" />
          ))}
        </Stack>
      ) : reminders.length === 0 ? (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            {emptyText}
          </Text>
        </Center>
      ) : (
        <Stack gap="0" mt="1">
          {reminders.map((reminder, i) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              isFirst={i === 0}
              handlers={handlers}
              showType={showType}
            />
          ))}
        </Stack>
      )}
    </DashboardCard>
  );
}
