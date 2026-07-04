import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomerListTemplate } from "../template/CustomerListTemplate";

export function CustomerListPage() {
  return (
    <>
      <Head title="Customers" description="Manage your customer database" />
      <UserDashboardContainer py="1.5rem">
        <CustomerListTemplate />
      </UserDashboardContainer>
    </>
  );
}
