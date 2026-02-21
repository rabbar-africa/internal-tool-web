import { Head } from "@/components/seo/head";
import { CreateInvoicePage } from "../components/create-invoice/CreateInvoicePage";

export function CreateInvoice() {
  return (
    <>
      <Head title="Create Invoice" description="Create a new invoice" />
      <CreateInvoicePage />
    </>
  );
}
