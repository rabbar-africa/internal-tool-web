import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Link, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { toaster } from "@/components/ui";
import { DownloadSimple } from "@/assets/custom";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ExpenseTabs } from "@/features/recurring-expenses/components/ExpenseTabs";
import moment from "moment";
import {
  CustomTable,
  SelectionActionBar,
  type TableAction,
} from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { PageHeader } from "@/components/common/PageHeader";
import { TruncatedText } from "@/components/common/TruncatedText";
import { ExportMenu } from "@/features/exports/components";
import { useServerExport } from "@/features/exports/hooks/useServerExport";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useUrlState } from "@/hooks/useUrlState";
import {
  EXPENSE_CATEGORY_OPTIONS,
  type Expense,
} from "@/shared/interface/expense";
import {
  AccountFilterSelect,
  formatAccountLabel,
} from "@/features/settings/components/account-details/AccountSelect";
import {
  useDeleteExpenseMutation,
  useDeleteExpensesBulkMutation,
  useGetExpensesQuery,
} from "../api/query";

/** "2019 Toyota Camry", from whichever parts were recorded. */
const vehicleName = (vehicle: Expense["vehicle"]) =>
  [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => (
      // Capped so a grouped expense's long name can't widen the column.
      <Stack gap="0" maxW="18rem">
        <TruncatedText
          lines={1}
          textStyle="small-regular"
          color="gray.500"
          fontWeight="500"
        >
          {row.original.name}
        </TruncatedText>
        {/* {row.original.invoice && (
          <Text fontSize="12px" color="primary.300" lineClamp={1}>
            for {row.original.invoice.invoiceNumber}
            {row.original.sharedLines?.length
              ? ` · ${row.original.sharedLines.map((l) => l.name).join(", ")}`
              : row.original.invoiceLineItem
                ? ` · ${row.original.invoiceLineItem.name}`
                : ""}
          </Text>
        )} */}
        {row.original.description && (
          <TruncatedText lines={1} fontSize="12px" color="gray.300">
            {row.original.description}
          </TruncatedText>
        )}
        {row.original.recurringExpense && (
          <Link
            asChild
            fontSize="12px"
            color="primary.300"
            w="fit-content"
            onClick={(e) => e.stopPropagation()}
          >
            <RouterLink
              to={RouteConstants.expenses.recurringDetail.generate({
                id: row.original.recurringExpense.id,
              })}
              title="Recorded by a recurring expense"
            >
              🔁 {row.original.recurringExpense.name}
            </RouterLink>
          </Link>
        )}
      </Stack>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => {
      const { vehicle } = row.original;
      const name = vehicleName(vehicle);
      const plate = vehicle?.registrationNumber;
      if (!name && !plate) {
        return (
          <Text textStyle="small-regular" color="gray.500">
            —
          </Text>
        );
      }
      return (
        <Stack gap="0">
          <Text textStyle="small-regular" color="gray.500" fontWeight="500">
            {name || plate}
          </Text>
          {name && plate && (
            <Text fontSize="12px" color="gray.300">
              {plate}
            </Text>
          )}
        </Stack>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    id: "jobCard",
    header: "Job Card",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.jobCard?.jobNumber ?? "—"}
      </Text>
    ),
  },
  {
    id: "paidThroughAccount",
    header: "Paid From",
    cell: ({ row }) => {
      const account = row.original.paidThroughAccount;
      return (
        <Text textStyle="small-regular" color="gray.500">
          {account ? formatAccountLabel(account) : "—"}
        </Text>
      );
    },
  },
];

// What the export has always held, as column keys from GET /exports/modules.
const EXPORT_COLUMNS = [
  "name",
  "customerName",
  "vehicle",
  "vehicleRegistration",
  "amount",
  "date",
  "paidThrough",
  "expenseNumber",
  "category",
  "jobNumber",
  "invoiceNumber",
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  category: { defaultValue: "" },
  jobCardId: { defaultValue: "" },
  // Set by an invoice's "View expenses"; cleared from the banner.
  invoiceId: { defaultValue: "" },
  // Set by a recurring expense's "See all"; cleared from the banner.
  recurringExpenseId: { defaultValue: "" },
  paidThroughAccountId: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

export function ExpenseListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const listFilters = {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.jobCardId ? { jobCardId: filters.jobCardId } : {}),
    ...(filters.invoiceId ? { invoiceId: filters.invoiceId } : {}),
    ...(filters.recurringExpenseId
      ? { recurringExpenseId: filters.recurringExpenseId }
      : {}),
    ...(filters.paidThroughAccountId
      ? { paidThroughAccountId: filters.paidThroughAccountId }
      : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  };
  const query = { page: filters.page, limit: filters.limit, ...listFilters };
  const { data, isLoading, isFetching } = useGetExpensesQuery(query);

  const { canDelete } = usePermissions();
  const { mutateAsync: deleteExpense, isPending: isDeleting } =
    useDeleteExpenseMutation();
  const { mutateAsync: deleteExpenses, isPending: isBulkDeleting } =
    useDeleteExpensesBulkMutation();

  // Ticked rows, by expense id. Cleared whenever the list changes, so a
  // bulk delete only ever takes rows that are on screen.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const queryKey = JSON.stringify(query);
  useEffect(() => setRowSelection({}), [queryKey]);

  const expenses = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const selectedExpenses = useMemo(
    () => expenses.filter((expense) => rowSelection[expense.id]),
    [expenses, rowSelection],
  );

  const { run: runExport, isPending: isExporting } =
    useServerExport("expenses");
  const exportSelected = () =>
    runExport({
      ids: selectedExpenses.map((expense) => expense.id),
      columns: EXPORT_COLUMNS,
    });

  const tableActions: TableAction<Expense>[] = [
    // Only on expenses linked to one; the job card follows the invoice's.
    {
      label: "View invoice",
      value: "view-invoice",
      hidden: (expense) => !expense.invoiceId,
      onClick: (expense) =>
        navigate(
          RouteConstants.invoices.detail.generate({ id: expense.invoiceId! }),
        ),
    },
    {
      label: "View job card",
      value: "view-job-card",
      hidden: (expense) => !expense.jobCardId,
      onClick: (expense) =>
        navigate(
          RouteConstants.jobCards.detail.generate({ id: expense.jobCardId! }),
        ),
    },
    {
      label: "View schedule",
      value: "view-schedule",
      hidden: (expense) => !expense.recurringExpense,
      onClick: (expense) =>
        navigate(
          RouteConstants.expenses.recurringDetail.generate({
            id: expense.recurringExpense!.id,
          }),
        ),
    },
    {
      label: "Edit",
      value: "edit",
      onClick: (expense) =>
        navigate(RouteConstants.expenses.edit.generate({ id: expense.id })),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (expense) => setPendingDelete(expense),
    },
  ];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteExpense(pendingDelete.id);
    setRowSelection((prev) => {
      if (!prev[pendingDelete.id]) return prev;
      const next = { ...prev };
      delete next[pendingDelete.id];
      return next;
    });
    setPendingDelete(null);
  };

  const handleBulkDelete = async () => {
    const result = await deleteExpenses(
      selectedExpenses.map((expense) => expense.id),
    );
    const deleted = result.data?.deleted ?? 0;
    toaster.create({
      type: "success",
      description: `${deleted} ${deleted === 1 ? "expense" : "expenses"} deleted`,
    });
    setRowSelection({});
    setConfirmBulkDelete(false);
  };

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Expense Tracking"
          subtitle="Record and monitor all business expenses"
          action={
            <Flex gap="2">
              <ExportMenu
                module="expenses"
                serverView={{
                  filters: listFilters,
                  selectedIds: selectedExpenses.map((expense) => expense.id),
                  columns: EXPORT_COLUMNS,
                  total: meta?.total ?? 0,
                }}
              />
              <Button
                variant="outline"
                onClick={() => navigate(RouteConstants.expenses.bulk.path)}
              >
                Add Several
              </Button>
              <Button
                onClick={() => navigate(RouteConstants.expenses.create.path)}
              >
                Add Expense
              </Button>
            </Flex>
          }
        />

        <ExpenseTabs active="all" />

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
                All Expenses
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {meta?.totalAmount != null
                  ? `Total for current filter: ${formatCurrency(meta.totalAmount)}`
                  : "Track all your business expenses"}
              </Text>
            </Box>
          </Flex>

          {/* A grid, not a wrapping flex: every select fills its parent's width,
              so in a flex each one took a whole line and they stacked. */}
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "1fr 1fr",
              xl: "minmax(0, 1fr) minmax(0, 1.2fr) auto minmax(0, 1.4fr)",
            }}
            alignItems="center"
            mb="1.5rem"
            gap="3"
          >
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
            <Flex gap="2" align="center" minW={0}>
              <DateField
                label="From"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(val) => setFilters({ dateFrom: val, page: 1 })}
                containerProps={{ flex: "1", minW: 0 }}
              />
              <DateField
                label="To"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(val) => setFilters({ dateTo: val, page: 1 })}
                containerProps={{ flex: "1", minW: 0 }}
              />
            </Flex>
            <SearchInput
              placeholder="Search by expense #, item or vendor"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={400}
              loading={isFetching}
              width="100%"
            />
          </Grid>

          {filters.invoiceId && (
            <Flex
              align="center"
              gap="2"
              mb="3"
              px="3"
              py="2"
              bg="primary.50"
              rounded="md"
              flexWrap="wrap"
            >
              <Text textStyle="small-regular" color="gray.500">
                Showing expenses for{" "}
                {expenses[0]?.invoice?.invoiceNumber ?? "one invoice"}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="primary.300"
                onClick={() => setFilters({ invoiceId: "", page: 1 })}
              >
                Show all
              </Button>
            </Flex>
          )}

          {filters.recurringExpenseId && (
            <Flex
              align="center"
              gap="2"
              mb="3"
              px="3"
              py="2"
              bg="primary.50"
              rounded="md"
              flexWrap="wrap"
            >
              <Text textStyle="small-regular" color="gray.500">
                Showing what{" "}
                {expenses[0]?.recurringExpense?.name ?? "one schedule"} recorded
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="primary.300"
                onClick={() => setFilters({ recurringExpenseId: "", page: 1 })}
              >
                Show all
              </Button>
            </Flex>
          )}

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={expenses}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={tableActions}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => row.id}
              showSelectionSummary={false}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.expenses.edit.generate({
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

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading={`Delete expense ${pendingDelete?.expenseNumber ?? ""}?`}
        note="The expense will no longer count against its job card's profit."
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
      />

      <SelectionActionBar
        count={selectedExpenses.length}
        onClear={() => setRowSelection({})}
      >
        <Button
          size="sm"
          variant="outline"
          loading={isExporting}
          onClick={exportSelected}
        >
          <DownloadSimple boxSize="3.5" />
          Export ({selectedExpenses.length})
        </Button>
        {canDelete("expenses") && (
          <Button
            size="sm"
            variant="outline"
            borderColor="error.300"
            color="error.300"
            _hover={{ bg: "error.50" }}
            onClick={() => setConfirmBulkDelete(true)}
          >
            <TrashIcon boxSize="3.5" />
            Delete ({selectedExpenses.length})
          </Button>
        )}
      </SelectionActionBar>

      <ConsentDialog
        open={confirmBulkDelete}
        onOpenChange={({ open }) => {
          if (!open && !isBulkDeleting) setConfirmBulkDelete(false);
        }}
        heading={`Delete ${selectedExpenses.length} ${
          selectedExpenses.length === 1 ? "expense" : "expenses"
        }?`}
        note={`${formatCurrency(
          selectedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        )} in total. They will no longer count against their job cards' profit.`}
        handleSubmit={() => void handleBulkDelete()}
        isLoading={isBulkDeleting}
      />
    </>
  );
}
