import { ActivityLog } from "@/features/activity/components/ActivityLog";
import { SettingsSubPage } from "../components/SettingsSubPage";

export function ActivityLogPage() {
  return (
    <SettingsSubPage
      title="Activity Log"
      subtitle="Who created, changed or deleted what, and when. Nobody can edit or remove these entries."
    >
      <ActivityLog />
    </SettingsSubPage>
  );
}
