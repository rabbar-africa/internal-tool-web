import { Head } from "@/components/seo/head";
import { CreateInvoicePage } from "../components/create-invoice/CreateInvoicePage";
// import { ForceDesktopView } from "@/components/common/ForceDesktopView";

export function EditInvoice() {
  return (
    <>
      <Head title="Edit Invoice" description="Edit an existing invoice" />
      {/* <ForceDesktopView /> */}

      <CreateInvoicePage mode="edit" />
    </>
  );
}
