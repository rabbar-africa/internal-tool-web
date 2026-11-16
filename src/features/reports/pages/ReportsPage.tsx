import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ReportsHome } from "../components/ReportsHome";

export function ReportsPage() {
  return (
    <>
      <Head title="Reports" description="Reports on your business's books" />
      <UserDashboardContainer py="1.5rem">
        <ReportsHome />
      </UserDashboardContainer>
    </>
  );
}
