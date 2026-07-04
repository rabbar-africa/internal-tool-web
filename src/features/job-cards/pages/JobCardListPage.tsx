import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { JobCardListTemplate } from "../template/JobCardListTemplate";

export function JobCardListPage() {
  return (
    <>
      <Head title="Job Cards" description="Track workshop repair jobs" />
      <UserDashboardContainer py="1.5rem">
        <JobCardListTemplate />
      </UserDashboardContainer>
    </>
  );
}
