import { PlanLimitNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable, SelectionActionBar } from "@/components/table";
import { DownloadSimple } from "@/assets/custom";
import { PlusLine } from "@/assets/custom/LineIcons";
import { exportToCSV } from "@/utils/exportToCSV";
import { PageHeader } from "@/components/common/PageHeader";
import { ExportMenu } from "@/features/exports/components";
import { RouteConstants } from "@/shared/constants/routes";
import { useInvoiceList } from "@/features/invoices/components/invoice-list/useInvoiceList";
import {
  INVOICE_CSV_HEADERS,
  toCsvRow,
  useInvoiceListColumns,
} from "@/features/invoices/components/invoice-list/columns";
import { InvoiceFilters } from "@/features/invoices/components/invoice-list/InvoiceFilters";
import { DeleteInvoiceConfirm } from "@/features/invoices/components/invoice-list/DeleteInvoiceConfirm";
import { CARD_SHADOW, FAINT_DIVIDER, FAINT_EDGE } from "@/theme/surfaces";
import { InvoiceStatsStrip } from "@/features/invoices/components/invoice-list/InvoiceStatsStrip";

export function InvoiceListTemplate() {
  const navigate = useNavigate();
  const { isAtLimit } = usePlanAccess();
  const {
    invoices,
    meta,
    isLoading,
    isFetching,
    csvData,
    selectedInvoices,

    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit,

    rowSelection,
    setRowSelection,

    tableActions,
    navigateToDetail,

    pendingDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useInvoiceList();

  const columns = useInvoiceListColumns();

  const selectionCount = selectedInvoices.length;

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Invoices"
          subtitle="Everything you've billed, and everything you're still owed."
          action={
            <Flex gap="2" wrap="wrap">
              <ExportMenu
                data={csvData}
                filename="invoices"
                headers={INVOICE_CSV_HEADERS}
                module="invoices"
              />
              <Button
                disabled={isAtLimit("invoices")}
                onClick={() => navigate(RouteConstants.invoices.create.path)}
              >
                <PlusLine />
                New invoice
              </Button>
            </Flex>
          }
        />

        <PlanLimitNotice limit="invoices" />

        <InvoiceStatsStrip
          onShowOverdue={() => setFilters({ status: "OVERDUE", page: 1 })}
        />

        <Box
          bg="white"
          rounded="18px"
          borderWidth="1px"
          borderColor={FAINT_EDGE}
          boxShadow={CARD_SHADOW}
          overflow="hidden"
        >
          <InvoiceFilters
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchCommit={handleSearchCommit}
            status={filters.status}
            onStatusChange={(val) => setFilters({ status: val, page: 1 })}
            dueDateFrom={filters.dueDateFrom}
            dueDateTo={filters.dueDateTo}
            onDueDateFromChange={(val) =>
              setFilters({ dueDateFrom: val, page: 1 })
            }
            onDueDateToChange={(val) => setFilters({ dueDateTo: val, page: 1 })}
            isLoading={isFetching}
          />

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
              data={invoices}
              columns={columns}
              loading={isLoading}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => row.id}
              showSelectionSummary={false}
              enableActions
              actions={tableActions}
              onRowClick={(row) => navigateToDetail(row.original)}
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

      <SelectionActionBar
        count={selectionCount}
        onClear={() => setRowSelection({})}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            exportToCSV(
              selectedInvoices.map(toCsvRow),
              "invoices-selected",
              INVOICE_CSV_HEADERS,
            )
          }
        >
          <DownloadSimple boxSize="3.5" />
          Export ({selectionCount})
        </Button>
      </SelectionActionBar>

      <DeleteInvoiceConfirm
        target={
          pendingDelete
            ? {
                id: pendingDelete.id,
                invoiceNumber: pendingDelete.invoiceNumber,
              }
            : null
        }
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
