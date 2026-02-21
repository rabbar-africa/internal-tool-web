import { Head } from "@/components/seo/head";
import { CustomerListPage } from "../components/customer-list/CustomerListPage";

export function CustomerList() {
  return (
    <>
      <Head title="Customers" description="Manage your customer database" />
      <CustomerListPage />
    </>
  );
}
