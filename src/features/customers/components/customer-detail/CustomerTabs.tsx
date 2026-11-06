import { useState } from "react";
import { Box, Button, Flex, Tabs } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { PlusIcon } from "@/assets/custom";
import {
  INVOICE_CSV_HEADERS,
  toCsvRow as invoiceToCsvRow,
  useInvoiceListColumns,
} from "@/features/invoices/components/invoice-list/columns";
import {
  JOB_CARD_CSV_HEADERS,
  jobCardColumns,
  toCsvRow as jobCardToCsvRow,
} from "@/features/job-cards/components/job-card-list/columns";
import {
  PAYMENT_CSV_HEADERS,
  paymentToCsvRow,
} from "@/features/payments/utils/payment-csv";
import { ExportMenu, customerExportScope } from "@/features/exports/components";
import type { Invoice } from "@/shared/interface/invoice";
import type { IPaymentReceived } from "@/shared/interface/payment";
import type { JobCard } from "@/shared/interface/job-card";
import type { Vehicle } from "../../api/service";
import { useDeleteVehicleMutation } from "../../api/query";
import {
  VEHICLE_CSV_HEADERS,
  paymentColumns,
  vehicleColumns,
  vehicleToCsvRow,
} from "./columns";
import { AddVehicleModal } from "./AddVehicleModal";

const scrollAreaProps = { maxW: { base: "xl", lg: "7xl" } };

const TAB_VALUES = ["invoices", "vehicles", "payments", "job-cards"] as const;
const DEFAULT_TAB = "invoices";

interface CustomerTabsProps {
  clientId: string;
  /** Names the file and the "Only for …" option in the export. */
  customerName: string;
  vehicles: Vehicle[];
  vehiclesLoading: boolean;
  invoices: Invoice[];
  invoicesLoading: boolean;
  payments: IPaymentReceived[];
  paymentsLoading: boolean;
  jobCards: JobCard[];
  jobCardsLoading: boolean;
  onAddVehicle: () => void;
}

export function CustomerTabs({
  clientId,
  customerName,
  vehicles,
  vehiclesLoading,
  invoices,
  invoicesLoading,
  payments,
  paymentsLoading,
  jobCards,
  jobCardsLoading,
  onAddVehicle,
}: CustomerTabsProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceColumns = useInvoiceListColumns();
  const exportScope = customerExportScope(clientId, customerName);
  // "Ade Motors" → "ade-motors", for the CSV's file name.
  const fileStem =
    customerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "customer";

  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const { mutateAsync: deleteVehicle, isPending: isDeleting } =
    useDeleteVehicleMutation();

  const vehicleActions: TableAction<Vehicle>[] = [
    {
      label: "Edit",
      value: "edit",
      onClick: (vehicle) => setEditVehicle(vehicle),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (vehicle) => setDeleteTarget(vehicle),
    },
  ];

  const confirmDeleteVehicle = async () => {
    if (!deleteTarget) return;
    await deleteVehicle(deleteTarget.id);
    setDeleteTarget(null);
  };

  const sectionParam = searchParams.get("section");
  const activeTab = TAB_VALUES.includes(
    sectionParam as (typeof TAB_VALUES)[number],
  )
    ? (sectionParam as string)
    : DEFAULT_TAB;

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("section", value);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <>
      <Box
        bg="white"
        rounded="xl"
        borderWidth="1px"
        borderColor="gray.75"
        shadow="xs"
        overflow="hidden"
      >
        <Tabs.Root
          value={activeTab}
          onValueChange={({ value }) => handleTabChange(value)}
        >
          <Tabs.List
            px="6"
            pt="3"
            borderBottomWidth="1px"
            borderColor="gray.75"
            bg="gray.50/50"
          >
            <Tabs.Trigger value="invoices" fontSize="13px">
              Invoices ({invoices.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="vehicles" fontSize="13px">
              Vehicles ({vehicles.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="payments" fontSize="13px">
              Payments ({payments.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="job-cards" fontSize="13px">
              Job Cards ({jobCards.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="vehicles" px="4" pb="4" pt="3">
            <Flex justify="flex-end" gap="2" mb="3">
              <ExportMenu
                size="sm"
                data={vehicles.map(vehicleToCsvRow)}
                filename={`${fileStem}-vehicles`}
                headers={VEHICLE_CSV_HEADERS}
                module="vehicles"
                scope={exportScope}
              />
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
            <Flex justify="flex-end" mb="3">
              <ExportMenu
                size="sm"
                data={invoices.map(invoiceToCsvRow)}
                filename={`${fileStem}-invoices`}
                headers={INVOICE_CSV_HEADERS}
                module="invoices"
                scope={exportScope}
              />
            </Flex>
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
            <Flex justify="flex-end" mb="3">
              <ExportMenu
                size="sm"
                data={payments.map(paymentToCsvRow)}
                filename={`${fileStem}-payments`}
                headers={PAYMENT_CSV_HEADERS}
                module="payments_received"
                scope={exportScope}
              />
            </Flex>
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

          <Tabs.Content value="job-cards" px="4" pb="4" pt="3">
            <Flex justify="flex-end" mb="3">
              <ExportMenu
                size="sm"
                data={jobCards.map(jobCardToCsvRow)}
                filename={`${fileStem}-job-cards`}
                headers={JOB_CARD_CSV_HEADERS}
                module="job_cards"
                scope={exportScope}
              />
            </Flex>
            <CustomTable
              data={jobCards}
              columns={jobCardColumns}
              loading={jobCardsLoading}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.jobCards.detail.generate({
                    id: row.original.id,
                  }),
                )
              }
              tableScrollAreaProps={scrollAreaProps}
            />
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      <AddVehicleModal
        open={Boolean(editVehicle)}
        onClose={() => setEditVehicle(null)}
        clientId={clientId}
        vehicle={editVehicle}
      />

      <ConsentDialog
        open={Boolean(deleteTarget)}
        onOpenChange={({ open }) => {
          if (!open) setDeleteTarget(null);
        }}
        heading={`Delete ${
          deleteTarget
            ? `${deleteTarget.make} ${deleteTarget.model}`
            : "vehicle"
        }?`}
        note="This removes the vehicle from this customer. Linked job cards and invoices are not affected."
        handleSubmit={confirmDeleteVehicle}
        isLoading={isDeleting}
      />
    </>
  );
}
