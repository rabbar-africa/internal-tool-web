import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { TechnicianListTemplate } from "../template/TechnicianListTemplate";

export function TechnicianListPage() {
  return (
    <>
      <Head title="Technicians" description="Manage workshop technicians" />
      <UserDashboardContainer py="1.5rem">
        <TechnicianListTemplate />
      </UserDashboardContainer>
    </>
  );
}
