import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ViewAllReportsTemplate } from "../template/ViewAllReportsTemplate";

export function ViewAllReportsPage() {
  return (
    <>
      <Head
        title="Inspection Reports"
        description="View all inspection reports"
      />
      <UserDashboardContainer py="1.5rem">
        <ViewAllReportsTemplate />
      </UserDashboardContainer>
    </>
  );
}
