import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateReminderTemplate } from "../template/CreateReminderTemplate";

export function CreateReminderPage() {
  return (
    <>
      <Head title="New Reminder" description="Create a reminder" />
      <UserDashboardContainer py="1.5rem">
        <CreateReminderTemplate />
      </UserDashboardContainer>
    </>
  );
}
