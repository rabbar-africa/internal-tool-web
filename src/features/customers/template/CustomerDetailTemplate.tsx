import { Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import { RouteConstants } from "@/shared/constants/routes";
import SectionLoader from "@/components/common/SectionLoader";
import { useGetAllInvoicesQuery } from "@/features/invoices/api/query";
import { useGetPaymentsQuery } from "@/features/payments/api/query";
import { useGetJobCardsQuery } from "@/features/job-cards/api/query";
import type { Invoice } from "@/shared/interface/invoice";
import type { IPaymentReceived } from "@/shared/interface/payment";
import type { JobCard } from "@/shared/interface/job-card";
import type { ICustomer } from "@/shared/interface/customer";
import {
  useGetClientStatsQuery,
  useGetCustomerByIdQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import { AddVehicleModal } from "@/features/customers/components/customer-detail/AddVehicleModal";
import { CustomerDetailHeader } from "@/features/customers/components/customer-detail/CustomerDetailHeader";
import { CustomerStats } from "@/features/customers/components/customer-detail/CustomerStats";
import { CustomerInfo } from "@/features/customers/components/customer-detail/CustomerInfo";
import { CustomerTabs } from "@/features/customers/components/customer-detail/CustomerTabs";

// The detail endpoint returns the base customer plus a few aggregate fields.
interface ICustomerDetail extends ICustomer {
  outstandingBalance?: number;
  totalInvoices?: number;
}

export function CustomerDetailTemplate() {
  const { id } = useParams<{ id: string }>();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  const { data: customerQueryData, isLoading } = useGetCustomerByIdQuery(
    id ?? "",
  );
  const { data: statsData, isLoading: statsLoading } = useGetClientStatsQuery(
    id ?? "",
  );
  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(id ?? "");
  const { data: invoicesData, isLoading: invoicesLoading } =
    useGetAllInvoicesQuery({ customerId: id ?? "" }, { enabled: Boolean(id) });
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({ customerId: id ?? "" });
  const { data: jobCardsData, isLoading: jobCardsLoading } =
    useGetJobCardsQuery({ clientId: id ?? "" }, { enabled: Boolean(id) });

  const customer = customerQueryData?.data as ICustomerDetail | undefined;
  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];
  const customerInvoices: Invoice[] = invoicesData?.data ?? [];
  const customerPayments: IPaymentReceived[] = paymentsData?.data ?? [];
  const customerJobCards: JobCard[] = jobCardsData?.data ?? [];

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

        <CustomerStats stats={statsData} isLoading={statsLoading} />

        <CustomerInfo customer={customer} />

        <CustomerTabs
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
          invoices={customerInvoices}
          invoicesLoading={invoicesLoading}
          payments={customerPayments}
          paymentsLoading={paymentsLoading}
          jobCards={customerJobCards}
          jobCardsLoading={jobCardsLoading}
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
