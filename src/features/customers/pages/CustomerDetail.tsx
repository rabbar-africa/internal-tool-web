import { Head } from "@/components/seo/head";
import { CustomerDetailPage } from "../components/customer-detail/CustomerDetailPage";

export function CustomerDetail() {
  return (
    <>
      <Head
        title="Customer Details"
        description="View customer details and history"
      />
      <CustomerDetailPage />
    </>
  );
}
