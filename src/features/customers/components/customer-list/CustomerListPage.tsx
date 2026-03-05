import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetAllCustomersQuery } from "../../api/query";
import { useUrlState } from "@/hooks/useUrlState";

interface ApiCustomer {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  stage: string;
  status: string;
  source: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "green.50", color: "green.600" },
  INACTIVE: { bg: "gray.100", color: "gray.400" },
};

const STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  CUSTOMER: { bg: "blue.50", color: "blue.600" },
  LEAD: { bg: "orange.50", color: "orange.600" },
};

const columns: ColumnDef<ApiCustomer>[] = [
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },

  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ getValue }) => {
      const stage = getValue() as string;
      const styles = STAGE_BADGE[stage] ?? {
        bg: "gray.100",
        color: "gray.500",
      };
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={styles.color}
            textTransform="capitalize"
          >
            {stage.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const styles = STATUS_BADGE[status] ?? {
        bg: "gray.100",
        color: "gray.400",
      };
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={styles.color}
            textTransform="capitalize"
          >
            {status.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
];

const CSV_HEADERS = {
  displayName: "Name",
  phone: "Phone",
  email: "Email",
  company: "Company",
  stage: "Stage",
  status: "Status",
} as const;

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  stage: { defaultValue: "" },
};

export function CustomerListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading } = useGetAllCustomersQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.stage ? { stage: filters.stage } : {}),
  });

  const customers: ApiCustomer[] = data?.data ?? [];
  const meta = data?.meta;

  const csvData = customers.map((c) => ({
    displayName: c.displayName,
    phone: c.phone ?? "",
    email: c.email ?? "",
    company: c.company ?? "",
    stage: c.stage,
    status: c.status,
  }));

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Customers"
          subtitle="Manage your customer database"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="customers"
                headers={CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.customers.create.path)}
              >
                Add Customer
              </Button>
            </Flex>
          }
        />

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
              placeholder="Search by name or phone"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isLoading}
            />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 380px)">
            <CustomTable
              data={customers}
              columns={columns}
              loading={isLoading}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.customers.detail.generate({
                    id: row.original.id,
                  }),
                )
              }
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
    </UserDashboardContainer>
  );
}
