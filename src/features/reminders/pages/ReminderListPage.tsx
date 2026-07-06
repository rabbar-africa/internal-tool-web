import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ReminderListTemplate } from "../template/ReminderListTemplate";

export function ReminderListPage() {
  return (
    <>
      <Head
        title="Reminders"
        description="Everything coming due — service, follow-ups and paperwork"
      />
      <UserDashboardContainer py="1.5rem">
        <ReminderListTemplate />
      </UserDashboardContainer>
    </>
  );
}
