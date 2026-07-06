import { useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Stack, Tabs, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteConstants } from "@/shared/constants/routes";
import { useUrlState } from "@/hooks/useUrlState";
import {
  reminderTypeLabel,
  REMINDER_STATUS_OPTIONS,
  type Reminder,
  type ReminderStatus,
} from "@/shared/interface/reminder";
import { useGetRemindersQuery } from "../api/query";
import { UpcomingRemindersPanel } from "../components/UpcomingRemindersPanel";
import { OverdueRemindersPanel } from "../components/OverdueRemindersPanel";
import { DueBadge } from "../components/reminder-shared/DueBadge";
import { useReminderActions } from "../components/reminder-shared/useReminderActions";
import { buildReminderTableActions } from "../components/reminder-shared/reminderTableActions";
import {
  formatDueDate,
  getDueInDays,
  reminderVehicleLabel,
} from "../utils/reminder";

const STATUS_STYLES: Record<ReminderStatus, { bg: string; color: string }> = {
  PENDING: { bg: "orange.50", color: "orange.600" },
  COMPLETED: { bg: "green.50", color: "green.600" },
  DISMISSED: { bg: "gray.100", color: "gray.500" },
};

const TABS = [
  { value: "all", label: "All", type: "" },
  { value: "SERVICE", label: "Service", type: "SERVICE" },
  { value: "FOLLOW_UP", label: "Follow-up", type: "FOLLOW_UP" },
  { value: "PAPERWORK", label: "Paperwork", type: "PAPERWORK" },
];

const STATUS_SELECT_OPTIONS = [
  { label: "All statuses", value: "" },
  ...REMINDER_STATUS_OPTIONS,
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  type: { defaultValue: "" },
  status: { defaultValue: "PENDING" },
};

const buildColumns = (showType: boolean): ColumnDef<Reminder>[] => [
  {
    accessorKey: "title",
    header: "Reminder",
    cell: ({ row }) => (
      <Stack gap="0">
        <Text textStyle="small-regular" color="gray.500" fontWeight="500">
          {row.original.title}
        </Text>
        {showType && (
          <Text fontSize="12px" color="gray.300">
            {reminderTypeLabel(row.original.type)}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    id: "client",
    header: "Client",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.client?.displayName ?? "—"}
      </Text>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {reminderVehicleLabel(row.original) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatDueDate(getValue() as string)}
      </Text>
    ),
  },
  {
    id: "dueIn",
    header: "Due In",
    cell: ({ row }) =>
      row.original.status === "PENDING" ? (
        <DueBadge days={getDueInDays(row.original)} />
      ) : (
        <Text textStyle="small-regular" color="gray.300">
          —
        </Text>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as ReminderStatus;
      const styles = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text fontSize="12px" fontWeight="500" color={styles.color}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
];

export function ReminderListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { handlers, dialogs } = useReminderActions();
  const tableActions = useMemo(
    () => buildReminderTableActions(handlers),
    [handlers],
  );

  const activeType = filters.type || undefined;
  const showType = !filters.type;

  const { data, isLoading, isFetching } = useGetRemindersQuery({
    page: filters.page,
    limit: filters.limit,
    ...(activeType ? { type: activeType } : {}),
    ...(filters.status ? { status: filters.status as ReminderStatus } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  });

  const reminders = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const columns = useMemo(() => buildColumns(showType), [showType]);

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Reminders"
          subtitle="Everything coming due — service, follow-ups and paperwork"
          action={
            <Flex gap="2">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(RouteConstants.reminders.scheduleService.path)
                }
              >
                Schedule Service
              </Button>
              <Button
                onClick={() => navigate(RouteConstants.reminders.create.path)}
              >
                New Reminder
              </Button>
            </Flex>
          }
        />

        <Tabs.Root
          value={filters.type || "all"}
          onValueChange={({ value }) => {
            const tab = TABS.find((t) => t.value === value);
            setFilters({ type: tab?.type ?? "", page: 1 });
          }}
          variant="line"
        >
          <Tabs.List>
            {TABS.map((tab) => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
          <UpcomingRemindersPanel
            title="Upcoming"
            subtitle="Due within the next 30 days"
            type={activeType}
            withinDays={30}
            limit={8}
            includeOverdue={false}
            handlers={handlers}
            showType={showType}
            emptyText="Nothing due in the next 30 days"
          />
          <OverdueRemindersPanel
            type={activeType}
            handlers={handlers}
            showType={showType}
          />
        </Grid>

        <Box
          pt={{ base: "1.25rem", md: "2rem" }}
          pb={{ base: "1.25rem", md: "2rem" }}
          bg="white"
          px={{ base: "0.75rem", md: "1rem" }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex
            justifyContent="space-between"
            alignItems={{ base: "flex-start", md: "center" }}
            mb="1rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            <Box>
              <Text textStyle="large-bold" color="gray.500">
                All Reminders
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {activeType
                  ? `${reminderTypeLabel(activeType)} reminders`
                  : "Every reminder across the workshop"}
              </Text>
            </Box>
          </Flex>

          <Flex
            justifyContent="flex-start"
            alignItems={{ base: "stretch", md: "center" }}
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
            wrap="wrap"
          >
            <CustomSelect
              placeholder="All statuses"
              options={STATUS_SELECT_OPTIONS}
              value={filters.status ? [filters.status] : [""]}
              onChange={(opt: { value: string[] }) =>
                setFilters({ status: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
              controlProps={{ w: { base: "100%", md: "170px" } }}
            />
            <SearchInput
              placeholder="Search by title or notes"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isFetching}
              width={{ base: "100%", md: "21rem" }}
            />
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={reminders}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={tableActions}
              NoDataText="No reminders match this filter."
              onRowClick={(row) =>
                navigate(
                  RouteConstants.reminders.edit.generate({
                    id: row.original.id,
                  }),
                )
              }
              pagination={{
                pageIndex: filters.page - 1,
                pageSize: filters.limit,
              }}
              setPagination={({ pageIndex }) =>
                setFilters({ page: pageIndex + 1 })
              }
              pageCount={meta?.totalPages ?? 1}
              totalItems={meta?.total}
              hasNextPage={filters.page < (meta?.totalPages ?? 1)}
              hasPrevPage={filters.page > 1}
            />
          </Box>
        </Box>
      </Stack>

      {dialogs}
    </>
  );
}
