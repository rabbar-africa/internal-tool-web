import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { MaturityReportTemplate } from "../template/MaturityReportTemplate";

export function MaturityReportPage() {
  return (
    <>
      <Head title="Maturity Report" description="Maturity Report" />
      <UserDashboardContainer pt="1.75rem">
        <MaturityReportTemplate />
      </UserDashboardContainer>
    </>
  );
}
