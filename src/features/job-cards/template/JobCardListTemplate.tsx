import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { useJobCardList } from "../components/job-card-list/useJobCardList";
import {
  JOB_CARD_CSV_HEADERS,
  jobCardColumns,
} from "../components/job-card-list/columns";
import { JobCardFilters } from "../components/job-card-list/JobCardFilters";

export function JobCardListTemplate() {
  const navigate = useNavigate();
  const {
    jobCards,
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
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useJobCardList();

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Job Cards"
          subtitle="Track every repair job from intake to delivery"
          action={
            <Flex gap="2" wrap="wrap">
              <DownloadButton
                data={csvData}
                filename="job-cards"
                headers={JOB_CARD_CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.jobCards.create.path)}
              >
                New Job Card
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
                All Job Cards
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                Click a row to view the full job card
              </Text>
            </Box>
          </Flex>

          <JobCardFilters
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchCommit={handleSearchCommit}
            status={filters.status}
            onStatusChange={(val) => setFilters({ status: val, page: 1 })}
            technicianId={filters.technicianId}
            onTechnicianChange={(val) =>
              setFilters({ technicianId: val, page: 1 })
            }
            isLoading={isFetching}
          />

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={jobCards}
              columns={jobCardColumns}
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
        heading={`Delete job card ${pendingDelete?.jobNumber ?? ""}?`}
        note="Linked invoices, inspections and payments will be unlinked, not deleted."
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
