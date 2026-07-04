import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ReportsTemplate } from "../template/ReportsTemplate";

export function ReportsPage() {
  return (
    <>
      <Head title="Reports" description="Financial reports and analytics" />
      <UserDashboardContainer py="1.5rem">
        <ReportsTemplate />
      </UserDashboardContainer>
    </>
  );
}
