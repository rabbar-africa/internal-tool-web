import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import {
  useGetCustomerByIdQuery,
  useGetVehiclesByClientQuery,
} from "../../api/query";
import type { Vehicle } from "../../api/service";
import { MOCK_INVOICES, MOCK_PAYMENTS } from "@/shared/data/mock";
import type { Invoice } from "@/shared/interface/invoice";
import type { Payment } from "@/shared/interface/payment";
import moment from "moment";
import SectionLoader from "@/components/common/SectionLoader";
import { AddVehicleModal } from "./AddVehicleModal";
import { ArrowLeft, PlusIcon } from "@/assets/custom";

// ── Column definitions ──────────────────────────────────────────────────────

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "issueDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "amountDue",
    header: "Due",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const isPaid = status === "paid";
      return (
        <Box
          display="inline-flex"
          bg={isPaid ? "green.50" : "orange.50"}
          px="10px"
          py="3px"
          rounded="full"
        >
          <Text
            fontSize="11px"
            fontWeight="500"
            color={isPaid ? "green.600" : "orange.600"}
            textTransform="capitalize"
          >
            {status}
          </Text>
        </Box>
      );
    },
  },
];

const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Box
        display="inline-flex"
        bg="green.50"
        px="10px"
        py="3px"
        rounded="full"
      >
        <Text
          fontSize="11px"
          fontWeight="500"
          color="green.600"
          textTransform="capitalize"
        >
          {getValue() as string}
        </Text>
      </Box>
    ),
  },
];

const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "registrationNumber",
    header: "Reg. No.",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="600">
        {getValue() as string}
      </Text>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.year} {row.original.make} {row.original.model}
      </Text>
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400" fontFamily="mono">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
];

// ── Info field helper ───────────────────────────────────────────────────────

function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="11px"
        color="gray.300"
        mb="1"
        fontWeight="500"
        letterSpacing="0.04em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="13.5px" color="gray.500">
        {value || "—"}
      </Text>
    </Box>
  );
}

// ── Stage badge helper ──────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  CUSTOMER: { bg: "green.50", color: "green.600" },
  RETURNING_CUSTOMER: { bg: "teal.50", color: "teal.600" },
  LEAD: { bg: "blue.50", color: "blue.600" },
  PROSPECT: { bg: "purple.50", color: "purple.600" },
  INACTIVE: { bg: "gray.100", color: "gray.400" },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const { data: customerQueryData, isLoading } = useGetCustomerByIdQuery(
    id ?? "",
  );
  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(id ?? "");

  const customer = customerQueryData?.data;
  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];

  const customerInvoices = MOCK_INVOICES.filter((inv) => inv.customerId === id);
  const customerPayments = MOCK_PAYMENTS.filter((p) => p.customerId === id);
  const totalPaid = customerPayments.reduce((s, p) => s + p.amount, 0);

  const vehicleActions: TableAction<Vehicle>[] = [];

  const stageStyle = STAGE_COLORS[customer?.stage ?? ""] ?? {
    bg: "gray.100",
    color: "gray.400",
  };

  const initials = [customer?.firstName?.[0], customer?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (isLoading) {
    return (
      <UserDashboardContainer py="1.5rem">
        <SectionLoader />
      </UserDashboardContainer>
    );
  }

  if (!customer) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text color="gray.400">Customer not found.</Text>
      </UserDashboardContainer>
    );
  }

  return (
    <>
      <UserDashboardContainer py="1.5rem">
        <Stack gap="5">
          {/* Back link */}
          <Button
            variant="ghost"
            size="sm"
            alignSelf="flex-start"
            color="gray.400"
            px="0"
            _hover={{ color: "gray.500", bg: "transparent" }}
            onClick={() => navigate(RouteConstants.customers.base.path)}
          >
            <ArrowLeft />
            Back to Customers
          </Button>

          {/* Hero header card */}
          <Box
            bg="white"
            rounded="2xl"
            overflow="hidden"
            shadow="xs"
            borderWidth="1px"
            borderColor="gray.75"
          >
            {/* Gradient stripe */}
            <Box
              h="6"
              bgGradient="to-r"
              gradientFrom="primary.100"
              gradientTo="primary.50"
            />

            <Flex
              px={{ base: "5", md: "8" }}
              pb="6"
              pt="0"
              gap="5"
              align="flex-end"
              direction={{ base: "column", sm: "row" }}
            >
              {/* Avatar overlapping the stripe */}
              <Avatar.Root
                size="2xl"
                mt="-6"
                bg="primary.200"
                color="white"
                borderWidth="3px"
                borderColor="white"
                shadow="md"
                flexShrink={0}
              >
                <Avatar.Fallback fontWeight="700" fontSize="xl">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>

              <Flex
                flex="1"
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap="3"
                pb="1"
              >
                <Box>
                  <Text
                    fontSize="1.2rem"
                    fontWeight="700"
                    color="gray.600"
                    lineHeight="1.2"
                  >
                    {customer.displayName}
                  </Text>
                  <Flex gap="2" mt="1.5" align="center" flexWrap="wrap">
                    {customer.stage && (
                      <Box
                        bg={stageStyle.bg}
                        px="8px"
                        py="2px"
                        rounded="full"
                        display="inline-flex"
                      >
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          color={stageStyle.color}
                          textTransform="capitalize"
                        >
                          {customer.stage.replace(/_/g, " ").toLowerCase()}
                        </Text>
                      </Box>
                    )}
                    {customer.source && (
                      <Text fontSize="11px" color="gray.300">
                        via {customer.source}
                      </Text>
                    )}
                  </Flex>
                </Box>

                <Text fontSize="11px" color="gray.300">
                  Since {moment(customer.createdAt).format("MMM YYYY")}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Stats row */}
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
            {[
              {
                label: "Total Paid",
                value: formatCurrency(totalPaid),
                accent: "green.500",
                bg: "green.50",
              },
              {
                label: "Outstanding",
                value: formatCurrency(customer.outstandingBalance ?? 0),
                accent: "orange.500",
                bg: "orange.50",
              },
              {
                label: "Total Invoices",
                value: String(customer.totalInvoices ?? 0),
                accent: "primary.300",
                bg: "primary.50",
              },
            ].map((stat) => (
              <Box
                key={stat.label}
                bg="white"
                rounded="xl"
                px="5"
                py="4"
                borderWidth="1px"
                borderColor="gray.75"
                shadow="xs"
              >
                <Flex align="center" gap="3">
                  <Box w="2" h="8" bg={stat.accent} rounded="full" />
                  <Box>
                    <Text fontSize="11px" color="gray.300" fontWeight="500">
                      {stat.label}
                    </Text>
                    <Text fontSize="1.05rem" fontWeight="700" color="gray.600">
                      {stat.value}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Grid>

          {/* Info grid */}
          <Box
            bg="white"
            rounded="xl"
            px={{ base: "5", md: "8" }}
            py="6"
            borderWidth="1px"
            borderColor="gray.75"
            shadow="xs"
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              color="gray.400"
              mb="5"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Contact & Details
            </Text>
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              }}
              gap="5"
            >
              <InfoField label="Email" value={customer.email} />
              <InfoField label="Phone" value={customer.phone} />
              <InfoField
                label="Type"
                value={
                  customer.type ? (
                    <Box
                      display="inline-flex"
                      bg="blue.50"
                      px="8px"
                      py="2px"
                      rounded="full"
                    >
                      <Text
                        fontSize="11px"
                        fontWeight="500"
                        color="blue.600"
                        textTransform="capitalize"
                      >
                        {customer.type}
                      </Text>
                    </Box>
                  ) : null
                }
              />
              <InfoField label="Company" value={customer.company} />
              <InfoField label="Job Title" value={customer.jobTitle} />
              <InfoField
                label="Address"
                value={
                  [
                    customer.address,
                    customer.city,
                    customer.state,
                    customer.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
            </Grid>
          </Box>

          {/* Tabs */}
          <Box
            bg="white"
            rounded="xl"
            borderWidth="1px"
            borderColor="gray.75"
            shadow="xs"
            overflow="hidden"
          >
            <Tabs.Root defaultValue="vehicles">
              <Tabs.List
                px="6"
                pt="3"
                borderBottomWidth="1px"
                borderColor="gray.75"
                bg="gray.50/50"
              >
                <Tabs.Trigger value="vehicles" fontSize="13px">
                  Vehicles ({vehicles.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="invoices" fontSize="13px">
                  Invoices ({customerInvoices.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="payments" fontSize="13px">
                  Payments ({customerPayments.length})
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="vehicles" px="4" pb="4" pt="3">
                <Flex justify="flex-end" mb="3">
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="primary.300"
                    color="primary.300"
                    onClick={() => setAddVehicleOpen(true)}
                  >
                    <PlusIcon />
                    Add Vehicle
                  </Button>
                </Flex>
                <CustomTable
                  data={vehicles}
                  columns={vehicleColumns}
                  loading={vehiclesLoading}
                  enableActions
                  actions={vehicleActions}
                  tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
                />
              </Tabs.Content>

              <Tabs.Content value="invoices" px="4" pb="4" pt="3">
                <CustomTable
                  data={customerInvoices}
                  columns={invoiceColumns}
                  loading={false}
                  tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
                />
              </Tabs.Content>

              <Tabs.Content value="payments" px="4" pb="4" pt="3">
                <CustomTable
                  data={customerPayments}
                  columns={paymentColumns}
                  loading={false}
                  tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
                />
              </Tabs.Content>
            </Tabs.Root>
          </Box>
        </Stack>
      </UserDashboardContainer>

      <AddVehicleModal
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        clientId={id ?? ""}
      />
    </>
  );
}
