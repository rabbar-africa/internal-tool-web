import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { PageHeader } from "@/components/common/PageHeader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { SearchInput } from "@/components/input/SearchInput";
import { ExportMenu } from "@/features/exports/components";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import {
  CREDIT_NOTE_CSV_HEADERS,
  useCreditNoteListColumns,
} from "../components/credit-note-list/columns";
import { useCreditNoteList } from "../components/credit-note-list/useCreditNoteList";
import { CREDIT_NOTE_STATUS_OPTIONS } from "../utils/credit-note-status";

export function CreditNoteListTemplate() {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const columns = useCreditNoteListColumns();
  const {
    creditNotes,
    meta,
    isLoading,
    isFetching,
    csvData,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit,
    tableActions,
    navigateToDetail,
    pendingDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
  } = useCreditNoteList();

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Credit Notes"
          subtitle="Give money back against an invoice: returns, overcharges, discounts and refunds"
          action={
            <Flex gap="2" wrap="wrap">
              <ExportMenu
                data={csvData}
                filename="credit-notes"
                headers={CREDIT_NOTE_CSV_HEADERS}
                module="credit_notes"
              />
              {canAccess("creditNoteCreate") && (
                <Button
                  onClick={() =>
                    navigate(RouteConstants.creditNotes.create.path)
                  }
                >
                  New Credit Note
                </Button>
              )}
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
          <Box mb="1rem">
            <Text
              textStyle={{ base: "default-bold", md: "large-bold" }}
              color="gray.500"
            >
              All Credit Notes
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Click a row to view the credit note
            </Text>
          </Box>

          <Flex
            alignItems={{ base: "stretch", md: "center" }}
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
            wrap="wrap"
          >
            <CustomSelect
              placeholder="All Status"
              options={CREDIT_NOTE_STATUS_OPTIONS}
              value={filters.status ? [filters.status] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ status: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
              controlProps={{ w: { base: "100%", md: "140px" } }}
            />
            <Flex gap="2" align="center" w={{ base: "100%", md: "auto" }}>
              <DateField
                label="From"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(value) => setFilters({ dateFrom: value, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
              <DateField
                label="To"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(value) => setFilters({ dateTo: value, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
            </Flex>
            <SearchInput
              placeholder="Search by credit note #, customer, invoice #"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearchCommit}
              debounceMs={400}
              loading={isFetching}
              width={{ base: "100%", md: "21rem" }}
            />
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={creditNotes}
              columns={columns}
              loading={isLoading}
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

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) cancelDelete();
        }}
        variant="danger"
        heading={`Delete ${pendingDelete?.creditNoteNumber ?? "this draft"}?`}
        note="Only drafts can be deleted. What it would have credited goes back on the invoice."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={isDeleting}
        handleSubmit={confirmDelete}
      />
    </>
  );
}
