import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { OverviewTemplate } from "../template/OverviewTemplate";

export function OverviewPage() {
  return (
    <>
      <Head title="Overview" description="Overview of your account" />
      <UserDashboardContainer py="1.5rem">
        <OverviewTemplate />
      </UserDashboardContainer>
    </>
  );
}
