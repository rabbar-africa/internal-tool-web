import { Head } from "@/components/seo/head";
import { DashboardPage } from "../components/dashboard/DashboardPage";

export function OverviewTemplate() {
  return (
    <>
      <Head
        title="Dashboard"
        description="Financial overview for Rabbar Africa"
      />
      <DashboardPage />
    </>
  );
}
