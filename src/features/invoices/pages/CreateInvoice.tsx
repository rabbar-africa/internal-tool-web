import { Head } from "@/components/seo/head";
import { CreateInvoicePage } from "../components/create-invoice/CreateInvoicePage";
// import { ForceDesktopView } from "@/components/common/ForceDesktopView";

export function CreateInvoice() {
  return (
    <>
      <Head title="Create Invoice" description="Create a new invoice" />
      {/* <ForceDesktopView /> */}

      <CreateInvoicePage />
    </>
  );
}
