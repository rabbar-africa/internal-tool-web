import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { InvoiceListTemplate } from "../template/InvoiceListTemplate";
import { ForceDesktopView } from "@/components/common/ForceDesktopView";

export function InvoiceListPage() {
  return (
    <>
      <Head title="Invoices" description="Manage your invoices" />
      <ForceDesktopView />
      <UserDashboardContainer py="1.5rem">
        <InvoiceListTemplate />
      </UserDashboardContainer>
    </>
  );
}
