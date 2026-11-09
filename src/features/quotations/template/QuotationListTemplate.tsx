import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { PageHeader } from "@/components/common/PageHeader";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { SearchInput } from "@/components/input/SearchInput";
import { ExportMenu } from "@/features/exports/components";
import { PlanLimitNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { usePermissions } from "@/hooks/usePermissions";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetQuotationSummaryQuery } from "../api/query";
import {
  QUOTATION_CSV_HEADERS,
  useQuotationListColumns,
} from "../components/quotation-list/columns";
import { useQuotationList } from "../components/quotation-list/useQuotationList";
import { QuotationStatusBadge } from "../components/QuotationStatusBadge";
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_OPTIONS,
} from "../utils/quotation-status";

/** One tile per status that has quotes; tapping one filters the list. */
function SummaryTiles({
  active,
  onPick,
}: {
  active: string;
  onPick: (status: string) => void;
}) {
  const { data } = useGetQuotationSummaryQuery();
  const { formatMoney } = useFormatMoney();
  const rows = data?.data?.byStatus ?? [];
  if (rows.length === 0) return null;

  return (
    <Grid
      templateColumns={{
        base: "repeat(2, 1fr)",
        md: "repeat(auto-fill, minmax(10rem, 1fr))",
      }}
      gap="3"
    >
      {rows.map((row) => {
        const isActive = active === row.status;
        return (
          <Box
            key={row.status}
            as="button"
            textAlign="left"
            bg="white"
            borderWidth="1px"
            borderColor={isActive ? "primary.300" : "gray.75"}
            rounded="lg"
            p="3"
            shadow="xs"
            cursor="pointer"
            _hover={{ borderColor: "primary.200" }}
            onClick={() => onPick(isActive ? "" : row.status)}
            aria-pressed={isActive}
            aria-label={`Show ${QUOTATION_STATUS_LABELS[row.status]} quotes`}
          >
            <QuotationStatusBadge
              status={row.status}
              h="1.375rem"
              minW="auto"
              w="fit-content"
            />
            <Text fontSize="18px" fontWeight="700" color="gray.500" mt="2">
              {row.count}
            </Text>
            <Text fontSize="12px" color="gray.300">
              {formatMoney(row.amount)}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
}

export function QuotationListTemplate() {
  const navigate = useNavigate();
  const { isAtLimit } = usePlanAccess();
  const { has } = usePermissions();
  const columns = useQuotationListColumns();
  const {
    quotations,
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
  } = useQuotationList();

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Quotes"
          subtitle="Price the work before you do it, then turn a yes into an invoice"
          action={
            <Flex gap="2" wrap="wrap">
              <ExportMenu
                data={csvData}
                filename="quotes"
                headers={QUOTATION_CSV_HEADERS}
                module="quotations"
              />
              {has("create:quotations") && (
                <Button
                  disabled={isAtLimit("quotations")}
                  onClick={() =>
                    navigate(RouteConstants.quotations.create.path)
                  }
                >
                  New Quote
                </Button>
              )}
            </Flex>
          }
        />

        <PlanLimitNotice limit="quotations" />

        <SummaryTiles
          active={filters.status}
          onPick={(status) => setFilters({ status, page: 1 })}
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
              All Quotes
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Click a row to view the quote
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
              options={QUOTATION_STATUS_OPTIONS}
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
              placeholder="Search by quote #, customer, reference"
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
              data={quotations}
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
        heading={`Delete ${pendingDelete?.quotationNumber ?? "this quote"}?`}
        note="The quote is removed from your lists. It still counts towards your plan's quote limit."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={isDeleting}
        handleSubmit={confirmDelete}
      />
    </>
  );
}
