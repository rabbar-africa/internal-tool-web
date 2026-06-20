import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { useInvoiceList } from "./useInvoiceList";
import { INVOICE_CSV_HEADERS, useInvoiceListColumns } from "./columns";
import { InvoiceFilters } from "./InvoiceFilters";
import { DeleteInvoiceConfirm } from "./DeleteInvoiceConfirm";

export function InvoiceListPage() {
  const navigate = useNavigate();
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
  const downloadFilename =
    selectionCount > 0 ? "invoices-selected" : "invoices";
  const downloadLabel =
    selectionCount > 0
      ? `Export ${selectionCount} selected`
      : "Export all (CSV)";

  return (
    <>
      <UserDashboardContainer py="1.5rem">
        <Stack gap="6">
          <PageHeader
            title="Invoices"
            subtitle="Manage and track all your invoices"
            action={
              <Flex gap="2" wrap="wrap">
                <DownloadButton
                  data={csvData}
                  filename={downloadFilename}
                  headers={INVOICE_CSV_HEADERS}
                  label={downloadLabel}
                />
                <Button
                  onClick={() => navigate(RouteConstants.invoices.create.path)}
                >
                  New Invoice
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
            <Flex justify="space-between" align="center" mb="1rem">
              <Box>
                <Text
                  textStyle={{ base: "default-bold", md: "large-bold" }}
                  color="gray.500"
                >
                  All Invoices
                </Text>
                <Text textStyle="small-regular" color="gray.300">
                  {selectionCount > 0
                    ? `${selectionCount} selected`
                    : "Click a row to view invoice details"}
                </Text>
              </Box>
            </Flex>

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
              onDueDateToChange={(val) =>
                setFilters({ dueDateTo: val, page: 1 })
              }
              isLoading={isFetching}
            />

            <Box
              overflowX="auto"
              // w="100%"
              // maxW={{ base: "100%", lg: "calc(100vw - 380px)" }}
              minW={0}
            >
              <CustomTable
                stickyHeader
                data={invoices}
                columns={columns}
                loading={isLoading}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={(row) => row.id}
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
      </UserDashboardContainer>

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
