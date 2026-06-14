import { Head } from "@/components/seo/head";
import { CustomerDetail } from "../components/customer-detail/CustomerDetail";

export function CustomerDetailPage() {
  return (
    <>
      <Head
        title="Customer Details"
        description="View customer details and history"
      />
      <CustomerDetail />
    </>
  );
}
