import { Head } from "@/components/seo/head";
import { InvoiceListPage } from "../components/invoice-list/InvoiceListPage";

export function InvoiceList() {
  return (
    <>
      <Head title="Invoices" description="Manage your invoices" />
      <InvoiceListPage />
    </>
  );
}
