import { useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useUrlState } from "@/hooks/useUrlState";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_OPTIONS,
  type Expense,
} from "@/shared/interface/expense";
import {
  AccountFilterSelect,
  formatAccountLabel,
} from "@/features/settings/components/account-details/AccountSelect";
import { useDeleteExpenseMutation, useGetExpensesQuery } from "../api/query";

/** "2019 Toyota Camry", from whichever parts were recorded. */
const vehicleName = (vehicle: Expense["vehicle"]) =>
  [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ");

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => (
      <Stack gap="0">
        <Text textStyle="small-regular" color="gray.500" fontWeight="500">
          {row.original.name}
        </Text>
        {row.original.invoice && (
          <Text fontSize="12px" color="primary.300" lineClamp={1}>
            for {row.original.invoice.invoiceNumber}
            {row.original.sharedLines?.length
              ? ` · ${row.original.sharedLines.map((l) => l.name).join(", ")}`
              : row.original.invoiceLineItem
                ? ` · ${row.original.invoiceLineItem.name}`
                : ""}
          </Text>
        )}
        {row.original.description && (
          <Text fontSize="12px" color="gray.300" lineClamp={1}>
            {row.original.description}
          </Text>
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

// exportToCSV writes columns in the order of each row's keys.
const CSV_HEADERS = {
  name: "Item",
  vehicle: "Vehicle",
  plateNumber: "Plate Number",
  amount: "Amount (₦)",
  date: "Date",
  paidThrough: "Paid From",
  expenseNumber: "Expense #",
  category: "Category",
  jobNumber: "Job Card",
  invoiceNumber: "Invoice",
} as const;

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  category: { defaultValue: "" },
  jobCardId: { defaultValue: "" },
  // Set by an invoice's "View expenses"; cleared from the banner.
  invoiceId: { defaultValue: "" },
  paidThroughAccountId: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

export function ExpenseListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const { data, isLoading, isFetching } = useGetExpensesQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.jobCardId ? { jobCardId: filters.jobCardId } : {}),
    ...(filters.invoiceId ? { invoiceId: filters.invoiceId } : {}),
    ...(filters.paidThroughAccountId
      ? { paidThroughAccountId: filters.paidThroughAccountId }
      : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });

  const { mutateAsync: deleteExpense, isPending: isDeleting } =
    useDeleteExpenseMutation();

  const expenses = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const csvData = expenses.map((expense) => ({
    name: expense.name,
    vehicle: vehicleName(expense.vehicle),
    plateNumber: expense.vehicle?.registrationNumber ?? "",
    amount: expense.amount,
    // A plain YYYY-MM-DD, which spreadsheets read as a date.
    date: expense.date.slice(0, 10),
    paidThrough: expense.paidThroughAccount
      ? formatAccountLabel(expense.paidThroughAccount)
      : "",
    expenseNumber: expense.expenseNumber,
    category: EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category,
    jobNumber: expense.jobCard?.jobNumber ?? "",
    invoiceNumber: expense.invoice?.invoiceNumber ?? "",
  }));

  const tableActions: TableAction<Expense>[] = [
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
    setPendingDelete(null);
  };

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Expense Tracking"
          subtitle="Record and monitor all business expenses"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="expenses"
                headers={CSV_HEADERS}
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

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={expenses}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={tableActions}
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
    </>
  );
}
