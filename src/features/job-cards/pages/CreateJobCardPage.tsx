import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateJobCardTemplate } from "../template/CreateJobCardTemplate";

export function CreateJobCardPage() {
  return (
    <>
      <Head title="New Job Card" description="Register an incoming job" />
      <UserDashboardContainer py="1.5rem">
        <CreateJobCardTemplate />
      </UserDashboardContainer>
    </>
  );
}
