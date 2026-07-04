import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditCustomerTemplate } from "../template/EditCustomerTemplate";

export function EditCustomerPage() {
  return (
    <>
      <Head title="Edit Customer" description="Update customer information" />
      <UserDashboardContainer py="1.5rem">
        <EditCustomerTemplate />
      </UserDashboardContainer>
    </>
  );
}
