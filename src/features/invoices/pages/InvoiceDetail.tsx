import { Head } from "@/components/seo/head";
import { InvoiceDetailPage } from "../components/invoice-detail/InvoiceDetailPage";
import { UserDashboardContainer } from "@/components/hoc";

export function InvoiceDetail() {
  return (
    <>
      <Head title="Invoice Detail" description="View invoice details" />
      <UserDashboardContainer>
        <InvoiceDetailPage />
      </UserDashboardContainer>
    </>
  );
}
