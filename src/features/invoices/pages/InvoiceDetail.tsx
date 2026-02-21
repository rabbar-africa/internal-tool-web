import { Head } from "@/components/seo/head";
import { InvoiceDetailPage } from "../components/invoice-detail/InvoiceDetailPage";

export function InvoiceDetail() {
  return (
    <>
      <Head title="Invoice Detail" description="View invoice details" />
      <InvoiceDetailPage />
    </>
  );
}
