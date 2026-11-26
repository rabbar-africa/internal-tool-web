import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { toaster } from "@/components/ui";
import { DownloadSimple } from "@/assets/custom";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ExpenseTabs } from "@/features/recurring-expenses/components/ExpenseTabs";
import { useExpenseVat } from "../components/ExpenseVatField";
import moment from "moment";
import {
  CustomTable,
  SelectionActionBar,
  type TableAction,
} from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { MenuFilter } from "@/components/input/MenuFilter";
import { PlusLine } from "@/assets/custom/LineIcons";
import { CARD_SHADOW, FAINT_DIVIDER, FAINT_EDGE } from "@/theme/surfaces";
import { ExpenseStatsStrip } from "../components/ExpenseStatsStrip";
import { DateField } from "@/components/input/DateField";
import { PageHeader } from "@/components/common/PageHeader";
import { TruncatedText } from "@/components/common/TruncatedText";
import { ExportMenu } from "@/features/exports/components";
import { useServerExport } from "@/features/exports/hooks/useServerExport";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useUrlState } from "@/hooks/useUrlState";
import type { Expense } from "@/shared/interface/expense";
import { useExpenseCategoryFilterOptions } from "@/features/expense-categories/components";
import {
  formatAccountLabel,
  useAccountOptions,
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
    // Shown only to a VAT-registered business (see `vatColumn` below).
    id: "vat",
    header: "VAT",
    cell: ({ row }) => {
      const tax = row.original.tax;
      if (!tax) {
        return (
          <Text textStyle="small-regular" color="gray.300">
            —
          </Text>
        );
      }
      return (
        <Stack gap="0">
          <Text textStyle="small-regular" color="gray.500">
            {formatCurrency(tax.amount)}
          </Text>
          <Text fontSize="11px" color="gray.300">
            {tax.claimable ? `${tax.name} ${tax.percent}%` : "Not claimable"}
          </Text>
        </Stack>
      );
    },
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

const plural = (n: number, one: string) =>
  `${n.toLocaleString("en-NG")} ${one}${n === 1 ? "" : "s"}`;

/** "Showing expenses for INV-001 · Show all": the list is narrowed to one thing. */
function ScopeNote({
  children,
  onClear,
}: {
  children: ReactNode;
  onClear: () => void;
}) {
  return (
    <Flex
      align="center"
      gap="2"
      px="3"
      py="1.5"
      bg="primary.50"
      rounded="lg"
      flexWrap="wrap"
    >
      <Text fontSize="13px" color="gray.500">
        {children}
      </Text>
      <Button
        size="xs"
        variant="ghost"
        color="primary.300"
        h="auto"
        px="1"
        onClick={onClear}
      >
        Show all
      </Button>
    </Flex>
  );
}

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
  categoryId: { defaultValue: "" },
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
  // The VAT column is for a VAT-registered business only.
  const { registered: vatRegistered } = useExpenseVat();
  const visibleColumns = useMemo(
    () => (vatRegistered ? columns : columns.filter((c) => c.id !== "vat")),
    [vatRegistered],
  );
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const categoryOptions = useExpenseCategoryFilterOptions();
  const { options: accountOptions } = useAccountOptions({ includeCash: true });

  const listFilters = {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
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
            <Flex gap="2" wrap="wrap">
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
                <PlusLine />
                Add Expense
              </Button>
            </Flex>
          }
        />

        <ExpenseTabs active="all" />

        <ExpenseStatsStrip
          onShowRange={({ from, to, categoryId }) => {
            setSearchInput("");
            setFilters({
              dateFrom: from,
              dateTo: to,
              categoryId: categoryId ?? "",
              search: "",
              page: 1,
            });
          }}
          onShowRecurring={() =>
            navigate(RouteConstants.expenses.recurring.path)
          }
        />

        <Box
          bg="white"
          rounded="18px"
          borderWidth="1px"
          borderColor={FAINT_EDGE}
          boxShadow={CARD_SHADOW}
          overflow="hidden"
        >
          {/* Filters in one row over a hairline, like the invoice list. */}
          <Flex
            align={{ base: "stretch", lg: "center" }}
            justify="space-between"
            direction={{ base: "column", lg: "row" }}
            gap="3"
            px={{ base: "3", md: "4" }}
            py="3"
            borderBottomWidth="1px"
            borderColor={FAINT_DIVIDER}
          >
            <Flex gap="2" align="center" wrap="wrap">
              <MenuFilter
                label="Category"
                value={filters.categoryId}
                options={[{ label: "All", value: "" }, ...categoryOptions]}
                onChange={(val) => setFilters({ categoryId: val, page: 1 })}
                triggerProps={{
                  flex: { base: "1 1 100%", sm: "0 0 auto" },
                  maxW: { sm: "16rem" },
                }}
              />
              <MenuFilter
                label="Paid from"
                value={filters.paidThroughAccountId}
                options={[{ label: "All", value: "" }, ...accountOptions]}
                onChange={(val) =>
                  setFilters({ paidThroughAccountId: val, page: 1 })
                }
                triggerProps={{
                  flex: { base: "1 1 100%", sm: "0 0 auto" },
                  maxW: { sm: "16rem" },
                }}
              />
              <DateField
                label="From"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(val) => setFilters({ dateFrom: val, page: 1 })}
                containerProps={{ flex: { base: "1", sm: "unset" } }}
              />
              <DateField
                label="To"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(val) => setFilters({ dateTo: val, page: 1 })}
                containerProps={{ flex: { base: "1", sm: "unset" } }}
              />
            </Flex>
            <SearchInput
              placeholder="Search expense #, item or vendor"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={400}
              loading={isFetching}
              width={{ base: "100%", lg: "18rem" }}
            />
          </Flex>

          {(filters.invoiceId ||
            filters.recurringExpenseId ||
            meta?.totalAmount != null) && (
            <Flex
              align="center"
              justify="space-between"
              gap="2"
              wrap="wrap"
              px={{ base: "3", md: "4" }}
              pt="3"
            >
              {filters.invoiceId ? (
                <ScopeNote
                  onClear={() => setFilters({ invoiceId: "", page: 1 })}
                >
                  Showing expenses for{" "}
                  {expenses[0]?.invoice?.invoiceNumber ?? "one invoice"}
                </ScopeNote>
              ) : filters.recurringExpenseId ? (
                <ScopeNote
                  onClear={() =>
                    setFilters({ recurringExpenseId: "", page: 1 })
                  }
                >
                  Showing what{" "}
                  {expenses[0]?.recurringExpense?.name ?? "one schedule"}{" "}
                  recorded
                </ScopeNote>
              ) : (
                <span />
              )}
              {meta?.totalAmount != null && (
                <Text fontSize="13px" color="gray.300">
                  {plural(meta.total ?? 0, "expense")} ·{" "}
                  <Text as="span" color="gray.500" fontWeight="600">
                    {formatCurrency(meta.totalAmount)}
                  </Text>
                </Text>
              )}
            </Flex>
          )}

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              tableRootProps={{ border: "none" }}
              tableHeaderProps={{
                bg: "white",
                color: "gray.300",
                fontSize: "12px",
                fontWeight: "500",
                py: "3",
                borderBottom: `1px solid ${FAINT_DIVIDER}`,
              }}
              data={expenses}
              columns={visibleColumns}
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
