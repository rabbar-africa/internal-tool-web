import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { GenerateInspectionTemplate } from "../template/GenerateInspectionTemplate";

export function GenerateInspectionPage() {
  return (
    <>
      <Head
        title="Generate Inspection"
        description="Generate a new inspection"
      />
      <UserDashboardContainer py="1.5rem">
        <GenerateInspectionTemplate />
      </UserDashboardContainer>
    </>
  );
}
