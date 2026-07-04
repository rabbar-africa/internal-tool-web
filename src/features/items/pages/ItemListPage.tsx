import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ItemListTemplate } from "../template/ItemListTemplate";

export function ItemListPage() {
  return (
    <>
      <Head
        title="Items & Services"
        description="Manage products and services"
      />
      <UserDashboardContainer py="1.5rem">
        <ItemListTemplate />
      </UserDashboardContainer>
    </>
  );
}
