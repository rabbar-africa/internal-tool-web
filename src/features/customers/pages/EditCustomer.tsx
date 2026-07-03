import { Head } from "@/components/seo/head";
import { EditCustomerPage } from "../components/edit-customer/EditCustomerPage";

export function EditCustomer() {
  return (
    <>
      <Head title="Edit Customer" description="Update customer information" />
      <EditCustomerPage />
    </>
  );
}
