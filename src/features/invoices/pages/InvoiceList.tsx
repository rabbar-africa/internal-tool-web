import { Head } from "@/components/seo/head";
import { InvoiceListPage } from "../components/invoice-list/InvoiceListPage";
import { ForceDesktopView } from "@/components/common/ForceDesktopView";

export function InvoiceList() {
  return (
    <>
      <Head title="Invoices" description="Manage your invoices" />
      <ForceDesktopView />

      <InvoiceListPage />
    </>
  );
}
