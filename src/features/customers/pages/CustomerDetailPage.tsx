import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomerDetailTemplate } from "../template/CustomerDetailTemplate";

export function CustomerDetailPage() {
  return (
    <>
      <Head
        title="Customer Details"
        description="View customer details and history"
      />
      <UserDashboardContainer py="1.5rem">
        <CustomerDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
