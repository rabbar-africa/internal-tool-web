import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateCustomerTemplate } from "../template/CreateCustomerTemplate";

export function CreateCustomerPage() {
  return (
    <>
      <Head title="Add Customer" description="Add a new customer" />
      <UserDashboardContainer py="1.5rem">
        <CreateCustomerTemplate />
      </UserDashboardContainer>
    </>
  );
}
