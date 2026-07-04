import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetItemsQuery } from "@/features/items/api/query";
import { useUrlState } from "@/hooks/useUrlState";
import { EditItemModal } from "@/features/items/components/item-list/EditItemModal";

interface ApiItem {
  id: string;
  name: string;
  description: string | null;
  rate: string;
  purchaseRate: string;
  productType: string;
  unit: string | null;
  status: string;
}

const PRODUCT_TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  GOODS: { bg: "blue.50", color: "blue.600" },
  SERVICE: { bg: "purple.50", color: "purple.600" },
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "green.50", color: "green.600" },
  INACTIVE: { bg: "gray.100", color: "gray.400" },
};

const columns: ColumnDef<ApiItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "productType",
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      const styles = PRODUCT_TYPE_STYLES[type] ?? {
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
            {type?.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(Number(getValue() as string))}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const styles = STATUS_STYLES[status] ?? {
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
            {status?.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
];

const CSV_HEADERS = {
  name: "Name",
  productType: "Type",
  unit: "Unit",
  rate: "Rate (₦)",
  purchaseRate: "Purchase Rate (₦)",
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
};

export function ItemListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [editItem, setEditItem] = useState<ApiItem | null>(null);

  const tableActions = useMemo<TableAction<ApiItem>[]>(
    () => [
      {
        label: "Edit",
        value: "edit",
        onClick: (item) => setEditItem(item),
      },
    ],
    [],
  );

  const { data, isLoading } = useGetItemsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  });

  const items: ApiItem[] = data?.data ?? [];
  const meta = data?.meta;

  const csvData = items.map((item) => ({
    name: item.name,
    productType: item.productType,
    unit: item.unit ?? "",
    rate: item.rate,
    purchaseRate: item.purchaseRate,
    status: item.status,
  }));

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Items & Services"
          subtitle="Manage products and services used in invoices"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="items-services"
                headers={CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.items.create.path)}
              >
                Add Item
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
              placeholder="Search by name"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isLoading}
            />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 380px)">
            <CustomTable
              data={items}
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

      {editItem && (
        <EditItemModal
          open={Boolean(editItem)}
          onClose={() => setEditItem(null)}
          item={editItem}
        />
      )}
    </>
  );
}
