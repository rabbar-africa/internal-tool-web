import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ScheduleServiceTemplate } from "../template/ScheduleServiceTemplate";

export function ScheduleServicePage() {
  return (
    <>
      <Head
        title="Schedule Service"
        description="Set up a recurring service reminder for a vehicle"
      />
      <UserDashboardContainer py="1.5rem">
        <ScheduleServiceTemplate />
      </UserDashboardContainer>
    </>
  );
}
