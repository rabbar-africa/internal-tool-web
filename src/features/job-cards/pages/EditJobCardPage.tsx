import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditJobCardTemplate } from "../template/EditJobCardTemplate";

export function EditJobCardPage() {
  return (
    <>
      <Head title="Edit Job Card" description="Update job card details" />
      <UserDashboardContainer py="1.5rem">
        <EditJobCardTemplate />
      </UserDashboardContainer>
    </>
  );
}
