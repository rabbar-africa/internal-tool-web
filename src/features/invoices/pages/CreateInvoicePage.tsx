import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateInvoiceTemplate } from "../template/CreateInvoiceTemplate";

export function CreateInvoicePage() {
  return (
    <>
      <Head title="Create Invoice" description="Create a new invoice" />
      <UserDashboardContainer py="1.5rem">
        <CreateInvoiceTemplate />
      </UserDashboardContainer>
    </>
  );
}
