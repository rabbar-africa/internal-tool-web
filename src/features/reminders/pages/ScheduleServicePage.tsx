import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ScheduleServiceTemplate } from "../template/ScheduleServiceTemplate";
import { PlanFeatureGate } from "@/features/billing/components/PlanLock";

export function ScheduleServicePage() {
  return (
    <>
      <Head
        title="Schedule Service"
        description="Set up a recurring service reminder for a vehicle"
      />
      <UserDashboardContainer py="1.5rem">
        <PlanFeatureGate feature="reminders">
          <ScheduleServiceTemplate />
        </PlanFeatureGate>
      </UserDashboardContainer>
    </>
  );
}
