import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateItemTemplate } from "../template/CreateItemTemplate";

export function CreateItemPage() {
  return (
    <>
      <Head title="Add Item" description="Add a new item or service" />
      <UserDashboardContainer py="1.5rem">
        <CreateItemTemplate />
      </UserDashboardContainer>
    </>
  );
}
