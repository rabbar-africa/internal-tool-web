import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetItemsQuery } from "../../api/query";
import type { Item, ItemStatus, ItemType } from "@/shared/interface/item";

const TYPE_STYLES: Record<ItemType, { bg: string; color: string }> = {
  product: { bg: "blue.50", color: "blue.600" },
  service: { bg: "purple.50", color: "purple.600" },
};

const STATUS_STYLES: Record<ItemStatus, { bg: string; color: string }> = {
  active: { bg: "green.50", color: "green.600" },
  inactive: { bg: "gray.100", color: "gray.400" },
};

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
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
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue() as ItemType;
      const styles = TYPE_STYLES[type];
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
            {type}
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
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "taxRate",
    header: "Tax Rate",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as number}%
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as ItemStatus;
      const styles = STATUS_STYLES[status];
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
            {status}
          </Text>
        </Box>
      );
    },
  },
];

const CSV_HEADERS = {
  code: "Code",
  name: "Name",
  type: "Type",
  unit: "Unit",
  unitPrice: "Unit Price (₦)",
  taxRate: "Tax Rate (%)",
  status: "Status",
} as const;

export function ItemListPage() {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useGetItemsQuery();

  const csvData = items.map((item) => ({
    code: item.code,
    name: item.name,
    type: item.type,
    unit: item.unit,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
    status: item.status,
  }));

  return (
    <UserDashboardContainer py="1.5rem">
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
            justifyContent="space-between"
            alignItems="center"
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            <Box>
              <Text textStyle="large-bold" color="gray.500">
                All Items & Services
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                Products and services available for invoicing
              </Text>
            </Box>
            <SearchInput placeholder="Search by name or code" />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 310px)">
            <CustomTable
              data={items}
              columns={columns}
              loading={isLoading}
              tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
            />
          </Box>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
