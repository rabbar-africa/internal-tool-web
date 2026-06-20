import { Box, Button, Flex, Tabs } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import { PlusIcon } from "@/assets/custom";
import { useInvoiceListColumns } from "@/features/invoices/components/invoice-list/columns";
import type { Invoice } from "@/shared/interface/invoice";
import type { IPaymentReceived } from "@/shared/interface/payment";
import type { Vehicle } from "../../api/service";
import { paymentColumns, vehicleColumns } from "./columns";

const scrollAreaProps = { maxW: { base: "xl", lg: "7xl" } };

interface CustomerTabsProps {
  vehicles: Vehicle[];
  vehiclesLoading: boolean;
  invoices: Invoice[];
  invoicesLoading: boolean;
  payments: IPaymentReceived[];
  paymentsLoading: boolean;
  onAddVehicle: () => void;
}

export function CustomerTabs({
  vehicles,
  vehiclesLoading,
  invoices,
  invoicesLoading,
  payments,
  paymentsLoading,
  onAddVehicle,
}: CustomerTabsProps) {
  const navigate = useNavigate();
  const invoiceColumns = useInvoiceListColumns();
  const vehicleActions: TableAction<Vehicle>[] = [];

  return (
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
            Invoices ({invoices.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="payments" fontSize="13px">
            Payments ({payments.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="vehicles" px="4" pb="4" pt="3">
          <Flex justify="flex-end" mb="3">
            <Button
              size="sm"
              variant="outline"
              borderColor="primary.300"
              color="primary.300"
              onClick={onAddVehicle}
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
            tableScrollAreaProps={scrollAreaProps}
          />
        </Tabs.Content>

        <Tabs.Content value="invoices" px="4" pb="4" pt="3">
          <CustomTable
            data={invoices}
            columns={invoiceColumns}
            loading={invoicesLoading}
            onRowClick={(row) =>
              navigate(
                RouteConstants.invoices.detail.generate({
                  id: row.original.id,
                }),
              )
            }
            tableScrollAreaProps={scrollAreaProps}
          />
        </Tabs.Content>

        <Tabs.Content value="payments" px="4" pb="4" pt="3">
          <CustomTable
            data={payments}
            columns={paymentColumns}
            loading={paymentsLoading}
            onRowClick={(row) =>
              navigate(
                RouteConstants.payments.detail.generate({
                  id: row.original.id,
                }),
              )
            }
            tableScrollAreaProps={scrollAreaProps}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
