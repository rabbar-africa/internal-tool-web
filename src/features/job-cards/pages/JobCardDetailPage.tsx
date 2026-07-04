import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { JobCardDetailTemplate } from "../template/JobCardDetailTemplate";

export function JobCardDetailPage() {
  return (
    <>
      <Head title="Job Card" description="Job card detail" />
      <UserDashboardContainer py="1.5rem">
        <JobCardDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
