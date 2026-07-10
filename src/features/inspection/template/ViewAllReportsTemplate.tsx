import { SearchInput } from "@/components/input/SearchInput";
import { CustomTable, type TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlState } from "@/hooks/useUrlState";
import Status from "@/components/common/Status";
import { CustomSelect } from "@/components/input/CustomSelect";
import {
  useGetAllInspectionsQuery,
  useDeleteInspectionMutation,
} from "@/features/inspection/api/query";
import { useInspectionPdf } from "@/features/inspection/hooks/useInspectionPdf";
import type { IInspection } from "@/shared/interface/inspection";
import moment from "moment";
import { TableActionItem } from "@/components/common/TableActionItem";
import { EyeIcon } from "@/assets/custom/EyeIcon";
import { TrashIcon } from "@/assets/custom/TrashIcon";
import { DownloadSimple } from "@/assets/custom/DownloadSimple";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
};

const columns: ColumnDef<IInspection>[] = [
  {
    accessorKey: "jobCode",
    header: "Job Code",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {(getValue() as string) ?? "—"}
      </Text>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.customerName ?? "—"}
      </Text>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => {
      const v = row.original.vehicle;
      if (!v)
        return (
          <Text textStyle="small-regular" color="gray.300">
            —
          </Text>
        );
      return (
        <Text textStyle="small-regular" color="gray.500">
          {[v.year, v.make, v.model].filter(Boolean).join(" ")}
        </Text>
      );
    },
  },

  {
    accessorKey: "inspectionDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("MMM DD, YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function ViewAllReportsTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { mutateAsync: deleteInspection } = useDeleteInspectionMutation();
  const { download: downloadReport } = useInspectionPdf();

  const tableActions = useMemo<TableAction<IInspection>[]>(
    () => [
      {
        label: <TableActionItem label={"View Details"} Icon={EyeIcon} />,
        onClick: (row) =>
          navigate(
            RouteConstants.inspection.inspectionDetails.generate({
              id: row.id,
            }),
          ),
      },
      {
        label: (
          <TableActionItem label={"Download Report"} Icon={DownloadSimple} />
        ),
        value: "download",
        onClick: (row) => downloadReport(row),
      },
      {
        label: <TableActionItem label={"Delete"} Icon={TrashIcon} />,
        value: "delete",
        variant: "destructive",
        onClick: (row) => deleteInspection(row.id),
      },
    ],
    [navigate, deleteInspection, downloadReport],
  );

  const { data, isLoading } = useGetAllInspectionsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  });

  const inspections: IInspection[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Stack gap="6">
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="h3-bold" color="gray.500">
            All Inspection Reports
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            View and track all generated inspection reports.
          </Text>
        </Box>

        <Button
          type="button"
          onClick={() =>
            navigate(RouteConstants.inspection.createInspection.path)
          }
        >
          Add Report
        </Button>
      </Flex>

      <Box
        pt="2rem"
        pb="2rem"
        bg="white"
        px="1rem"
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Flex
          justifyContent="flex-start"
          alignItems="center"
          mb="1.5rem"
          gap="3"
          direction={{ base: "column", md: "row" }}
        >
          <CustomSelect
            placeholder="All Status"
            options={STATUS_OPTIONS}
            value={filters.status ? [filters.status] : undefined}
            onChange={(opt: { value: string[] }) => {
              setFilters({ status: opt?.value?.[0] ?? "", page: 1 });
            }}
            rootProps={{ size: "sm" }}
            controlProps={{ w: "140px" }}
          />

          <SearchInput
            placeholder="Search by customer or job code"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={(val) => setFilters({ search: val, page: 1 })}
            debounceMs={500}
            loading={isLoading}
          />
        </Flex>

        <Box overflowX="auto" maxW="calc(100vw - 380px)">
          <CustomTable
            data={inspections}
            columns={columns}
            loading={isLoading}
            enableActions
            actions={tableActions}
            tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
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
  );
}
