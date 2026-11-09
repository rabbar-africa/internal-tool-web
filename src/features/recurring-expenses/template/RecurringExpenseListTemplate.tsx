import { useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { PageHeader } from "@/components/common/PageHeader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SearchInput } from "@/components/input/SearchInput";
import { PlanFeatureNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { usePermissions } from "@/hooks/usePermissions";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useUrlState } from "@/hooks/useUrlState";
import { RouteConstants } from "@/shared/constants/routes";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_OPTIONS,
} from "@/shared/interface/expense";
import type { IRecurringExpense } from "@/shared/interface/recurring-expense";
import {
  AccountFilterSelect,
  formatAccountLabel,
} from "@/features/settings/components/account-details/AccountSelect";
import {
  useDeleteRecurringExpenseMutation,
  useGetRecurringExpenseSummaryQuery,
  useGetRecurringExpensesQuery,
} from "../api/query";
import { ExpenseTabs } from "../components/ExpenseTabs";
import { RecurringStatusBadge } from "../components/RecurringStatusBadge";
import { RECURRING_STATUS_OPTIONS, formatDay } from "../utils/recurring";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  category: { defaultValue: "" },
  paidThroughAccountId: { defaultValue: "" },
};

/** "Fixed costs: ₦450,000 a month", with the categories underneath. */
function FixedCosts() {
  const { data } = useGetRecurringExpenseSummaryQuery();
  const { formatMoney } = useFormatMoney();
  const summary = data?.data;
  if (!summary || summary.activeCount === 0) return null;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="xs"
      p={{ base: "4", md: "5" }}
    >
      <Text fontSize="13px" color="gray.300">
        Fixed costs · {summary.activeCount} active
      </Text>
      <Text
        fontSize={{ base: "20px", md: "24px" }}
        fontWeight="700"
        color="gray.500"
      >
        {formatMoney(summary.monthlyEquivalent)}{" "}
        <Text as="span" fontSize="14px" fontWeight="500" color="gray.300">
          a month
        </Text>
      </Text>
      {summary.byCategory.length > 0 && (
        <Flex gap="2" wrap="wrap" mt="3">
          {summary.byCategory.map((row) => (
            <Box
              key={row.category}
              bg="gray.25"
              borderWidth="1px"
              borderColor="gray.75"
              rounded="md"
              px="2.5"
              py="1"
            >
              <Text fontSize="12px" color="gray.400">
                {EXPENSE_CATEGORY_LABELS[row.category] ?? row.category} ·{" "}
                <Text as="span" fontWeight="600" color="gray.500">
                  {formatMoney(row.monthlyEquivalent)}
                </Text>
              </Text>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}

export function RecurringExpenseListTemplate() {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const { has } = usePermissions();
  const { hasFeature } = usePlanAccess();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<IRecurringExpense | null>(
    null,
  );
  const { mutateAsync: remove, isPending: isDeleting } =
    useDeleteRecurringExpenseMutation();

  const { data, isLoading, isFetching } = useGetRecurringExpensesQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.paidThroughAccountId
      ? { paidThroughAccountId: filters.paidThroughAccountId }
      : {}),
  });
  const schedules = data?.data ?? [];
  const meta = data?.meta;

  const toDetail = (schedule: IRecurringExpense) =>
    navigate(
      RouteConstants.expenses.recurringDetail.generate({ id: schedule.id }),
    );

  const columns = useMemo<ColumnDef<IRecurringExpense>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Expense",
        cell: ({ row }) => (
          <Stack gap="0" maxW="16rem">
            <Text textStyle="small-regular" color="gray.500" fontWeight="500">
              {row.original.name}
            </Text>
            <Text fontSize="12px" color="gray.300">
              {EXPENSE_CATEGORY_LABELS[row.original.category] ??
                row.original.category}
              {row.original.vendorName ? ` · ${row.original.vendorName}` : ""}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Stack gap="0">
            <Text textStyle="small-regular" color="gray.500" fontWeight="600">
              {formatMoney(row.original.amount)}
            </Text>
            <Text fontSize="12px" color="gray.300">
              {row.original.describe}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "nextDate",
        header: "Next",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.500">
            {row.original.nextDate ? formatDay(row.original.nextDate) : "—"}
          </Text>
        ),
      },
      {
        id: "paidFrom",
        header: "Paid From",
        cell: ({ row }) => (
          <Text textStyle="small-regular" color="gray.500">
            {row.original.paidThroughAccount
              ? formatAccountLabel(row.original.paidThroughAccount)
              : "Default account"}
          </Text>
        ),
      },
      {
        accessorKey: "madeCount",
        header: "Recorded",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500">
            {getValue() as number}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <RecurringStatusBadge
            status={row.original.status}
            title={row.original.pausedReason ?? undefined}
          />
        ),
      },
    ],
    [formatMoney],
  );

  const actions: TableAction<IRecurringExpense>[] = [
    { label: "View", value: "view", onClick: toDetail },
    {
      label: "Edit",
      value: "edit",
      hidden: (s) => s.status === "STOPPED" || !has("update:expenses"),
      onClick: (s) =>
        navigate(RouteConstants.expenses.recurringEdit.generate({ id: s.id })),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      hidden: () => !has("delete:expenses"),
      onClick: setPendingDelete,
    },
  ];

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Expense Tracking"
          subtitle="Costs that come round again, recorded for you on each date"
          action={
            has("create:expenses") ? (
              <Button
                disabled={!hasFeature("recurringExpenses")}
                onClick={() =>
                  navigate(RouteConstants.expenses.recurringCreate.path)
                }
              >
                New Recurring Expense
              </Button>
            ) : undefined
          }
        />

        <ExpenseTabs active="recurring" />

        <PlanFeatureNotice feature="recurringExpenses" />

        <FixedCosts />

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
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "1fr 1fr",
              xl: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.4fr)",
            }}
            alignItems="center"
            mb="1.5rem"
            gap="3"
          >
            <CustomSelect
              placeholder="All Statuses"
              options={RECURRING_STATUS_OPTIONS}
              value={filters.status ? [filters.status] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ status: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: "100%" }}
              controlProps={{ w: "100%" }}
            />
            <CustomSelect
              placeholder="All Categories"
              options={EXPENSE_CATEGORY_OPTIONS}
              value={filters.category ? [filters.category] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ category: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: "100%" }}
              controlProps={{ w: "100%" }}
            />
            <AccountFilterSelect
              fullWidth
              value={filters.paidThroughAccountId}
              onChange={(id) =>
                setFilters({ paidThroughAccountId: id, page: 1 })
              }
            />
            <SearchInput
              placeholder="Search by name or who it's paid to"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={400}
              loading={isFetching}
              width="100%"
            />
          </Grid>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={schedules}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={actions}
              onRowClick={(row) => toDetail(row.original)}
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

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading={`Delete ${pendingDelete?.name ?? "this recurring expense"}?`}
        note="The schedule goes, and the expenses it recorded stay."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={isDeleting}
        handleSubmit={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
