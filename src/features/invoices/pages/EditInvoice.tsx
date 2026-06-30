import { Head } from "@/components/seo/head";
import { CreateInvoicePage } from "../components/create-invoice/CreateInvoicePage";

export function EditInvoice() {
  return (
    <>
      <Head title="Edit Invoice" description="Edit an existing invoice" />
      <CreateInvoicePage mode="edit" />
    </>
  );
}
