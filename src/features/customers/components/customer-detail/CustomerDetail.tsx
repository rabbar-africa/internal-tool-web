import { Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import { RouteConstants } from "@/shared/constants/routes";
import SectionLoader from "@/components/common/SectionLoader";
import { useGetAllInvoicesQuery } from "@/features/invoices/api/query";
import { useGetPaymentsQuery } from "@/features/payments/api/query";
import type { Invoice } from "@/shared/interface/invoice";
import type { IPaymentReceived } from "@/shared/interface/payment";
import type { ICustomer } from "@/shared/interface/customer";
import {
  useGetCustomerByIdQuery,
  useGetVehiclesByClientQuery,
} from "../../api/query";
import type { Vehicle } from "../../api/service";
import { AddVehicleModal } from "./AddVehicleModal";
import { CustomerDetailHeader } from "./CustomerDetailHeader";
import { CustomerStats } from "./CustomerStats";
import { CustomerInfo } from "./CustomerInfo";
import { CustomerTabs } from "./CustomerTabs";

// The detail endpoint returns the base customer plus a few aggregate fields.
interface ICustomerDetail extends ICustomer {
  outstandingBalance?: number;
  totalInvoices?: number;
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const { data: customerQueryData, isLoading } = useGetCustomerByIdQuery(
    id ?? "",
  );
  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(id ?? "");
  const { data: invoicesData, isLoading: invoicesLoading } =
    useGetAllInvoicesQuery({ customerId: id ?? "" }, { enabled: Boolean(id) });
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({ customerId: id ?? "" });

  const customer = customerQueryData?.data as ICustomerDetail | undefined;
  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];
  const customerInvoices: Invoice[] = invoicesData?.data ?? [];
  const customerPayments: IPaymentReceived[] = paymentsData?.data ?? [];
  const totalPaid = customerPayments.reduce(
    (s, p) => s + (Number(p.amount) || 0),
    0,
  );

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!customer) {
    return <Text color="gray.400">Customer not found.</Text>;
  }

  return (
    <>
      <Stack gap="5">
        <CustomBreadCrumb
          items={[
            { label: "Customers", to: RouteConstants.customers.base.path },
            { label: customer.displayName, isCurrent: true },
          ]}
        />

        <CustomerDetailHeader customer={customer} />

        <CustomerStats
          totalPaid={totalPaid}
          outstanding={customer.outstandingBalance ?? 0}
          totalInvoices={customer.totalInvoices ?? 0}
        />

        <CustomerInfo customer={customer} />

        <CustomerTabs
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
          invoices={customerInvoices}
          invoicesLoading={invoicesLoading}
          payments={customerPayments}
          paymentsLoading={paymentsLoading}
          onAddVehicle={() => setAddVehicleOpen(true)}
        />
      </Stack>

      <AddVehicleModal
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        clientId={id ?? ""}
      />
    </>
  );
}
