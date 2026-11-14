import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ReportViewer } from "../components/ReportViewer";

export function ReportViewerPage() {
  return (
    <>
      <Head title="Report" description="A report on your business's books" />
      <UserDashboardContainer py="1.5rem">
        <ReportViewer />
      </UserDashboardContainer>
    </>
  );
}
