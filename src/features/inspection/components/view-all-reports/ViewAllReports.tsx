import { SearchInput } from "@/components/input/SearchInput";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { RouteConstants } from "@/shared/constants/routes";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

type ReportStatus = "Completed" | "Pending" | "Failed";

type InspectionReport = {
  reportId: string;
  customerName: string;
  vehicleNumber: string;
  inspector: string;
  date: string;
  status: ReportStatus;
};

const inspectionReportData: InspectionReport[] = [
  {
    reportId: "IR-1001",
    customerName: "John Doe",
    vehicleNumber: "LND-404GH",
    inspector: "Samuel A.",
    date: "2024-04-10",
    status: "Completed",
  },
  {
    reportId: "IR-1002",
    customerName: "Jane Peters",
    vehicleNumber: "KJA-220AB",
    inspector: "Ifeoma O.",
    date: "2024-04-11",
    status: "Pending",
  },
  {
    reportId: "IR-1003",
    customerName: "Michael Umeh",
    vehicleNumber: "ABC-918ZX",
    inspector: "David M.",
    date: "2024-04-11",
    status: "Failed",
  },
  {
    reportId: "IR-1004",
    customerName: "Ngozi Obi",
    vehicleNumber: "ENU-100KL",
    inspector: "Samuel A.",
    date: "2024-04-12",
    status: "Completed",
  },
  {
    reportId: "IR-1005",
    customerName: "Emeka Nwosu",
    vehicleNumber: "PHC-017MM",
    inspector: "Ifeoma O.",
    date: "2024-04-12",
    status: "Completed",
  },
];

const columns: ColumnDef<InspectionReport>[] = [
  {
    accessorKey: "reportId",
    header: "Report ID",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle Number",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "inspector",
    header: "Inspector",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as ReportStatus;
      const bg =
        status === "Completed"
          ? "success.50"
          : status === "Pending"
            ? "warning.50"
            : "error.50";

      const color =
        status === "Completed"
          ? "success.300"
          : status === "Pending"
            ? "warning.600"
            : "error.400";

      return (
        <Box
          display="inline-flex"
          width="100px"
          height="32px"
          px="10px"
          py="4px"
          borderRadius="6px"
          bg={bg}
          alignItems="center"
          justifyContent="center"
        >
          <Text textStyle={"small-regular"} color={color}>
            {status}
          </Text>
        </Box>
      );
    },
  },
];

export function ViewAllReports() {
  const navigate = useNavigate();

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <Flex
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle={"h3-bold"} color={"gray.500"}>
              All Inspection Reports
            </Text>
            <Text textStyle={"small-regular"} color={"gray.300"} mt="1">
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
          bg={"white"}
          px={"1rem"}
          rounded={".625rem"}
          shadow={"md"}
        >
          <Flex
            justifyContent={"space-between"}
            alignItems={"center"}
            mb={"1.5rem"}
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            <Box>
              <Text textStyle={"large-bold"}>Inspection Reports</Text>
              <Text textStyle={"small-regular"} color={"gray.500"}>
                Search and review generated reports.
              </Text>
            </Box>
            <SearchInput placeholder="Search by customer or report ID" />
          </Flex>

          <Box overflowX={"auto"} maxW="calc(100vw - 310px)">
            <CustomTable
              data={inspectionReportData}
              columns={columns}
              tableScrollAreaProps={{ maxW: { base: "xl", lg: "6xl" } }}
            />
          </Box>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
