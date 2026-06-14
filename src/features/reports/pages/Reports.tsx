import { Head } from "@/components/seo/head";
import { ReportsDashboardPage } from "../components/ReportsDashboardPage";

export function Reports() {
  return (
    <>
      <Head title="Reports" description="Financial reports and analytics" />
      <ReportsDashboardPage />
    </>
  );
}
