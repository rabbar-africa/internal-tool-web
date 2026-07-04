import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateInvoiceTemplate } from "../template/CreateInvoiceTemplate";

export function EditInvoicePage() {
  return (
    <>
      <Head title="Edit Invoice" description="Edit an existing invoice" />
      <UserDashboardContainer py="1.5rem">
        <CreateInvoiceTemplate mode="edit" />
      </UserDashboardContainer>
    </>
  );
}
