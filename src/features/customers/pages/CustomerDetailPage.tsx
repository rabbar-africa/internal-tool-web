import { Head } from "@/components/seo/head";
import { CustomerDetail } from "../components/customer-detail/CustomerDetail";
import { UserDashboardContainer } from "@/components/hoc";

export function CustomerDetailPage() {
  return (
    <>
      <Head
        title="Customer Details"
        description="View customer details and history"
      />
      <UserDashboardContainer py="1.5rem">
        <CustomerDetail />
      </UserDashboardContainer>
    </>
  );
}
