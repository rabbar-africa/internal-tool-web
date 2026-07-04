import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { InvoiceDetailTemplate } from "../template/InvoiceDetailTemplate";
import { ForceDesktopView } from "@/components/common/ForceDesktopView";

export function InvoiceDetailPage() {
  return (
    <>
      <Head title="Invoice Detail" description="View invoice details" />
      <ForceDesktopView />
      <UserDashboardContainer>
        <InvoiceDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
