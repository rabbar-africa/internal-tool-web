import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditReminderTemplate } from "../template/EditReminderTemplate";

export function EditReminderPage() {
  return (
    <>
      <Head title="Edit Reminder" description="Edit a reminder" />
      <UserDashboardContainer py="1.5rem">
        <EditReminderTemplate />
      </UserDashboardContainer>
    </>
  );
}
