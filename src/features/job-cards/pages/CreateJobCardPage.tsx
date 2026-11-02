import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateJobCardTemplate } from "../template/CreateJobCardTemplate";
import { PlanLimitGate } from "@/features/billing/components/PlanLock";

export function CreateJobCardPage() {
  return (
    <>
      <Head title="New Job Card" description="Register an incoming job" />
      <UserDashboardContainer py="1.5rem">
        <PlanLimitGate limit="jobCards">
          <CreateJobCardTemplate />
        </PlanLimitGate>
      </UserDashboardContainer>
    </>
  );
}
