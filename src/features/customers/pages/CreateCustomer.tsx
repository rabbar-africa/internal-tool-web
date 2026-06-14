import { Head } from "@/components/seo/head";
import { CreateCustomerPage } from "../components/create-customer/CreateCustomerPage";

export function CreateCustomer() {
  return (
    <>
      <Head title="Add Customer" description="Add a new customer" />
      <CreateCustomerPage />
    </>
  );
}
