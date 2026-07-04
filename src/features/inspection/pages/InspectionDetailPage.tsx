import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { InspectionDetailTemplate } from "../template/InspectionDetailTemplate";

export function InspectionDetailPage() {
  return (
    <>
      <Head
        title="Inspection Detail"
        description="View inspection report details"
      />
      <UserDashboardContainer py="1.5rem">
        <InspectionDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
