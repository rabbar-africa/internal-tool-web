import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { GenerateInspectionTemplate } from "../template/GenerateInspectionTemplate";

export function EditInspectionPage() {
  return (
    <>
      <Head title="Edit Inspection" description="Edit an existing inspection" />
      <UserDashboardContainer py="1.5rem">
        <GenerateInspectionTemplate mode="edit" />
      </UserDashboardContainer>
    </>
  );
}
