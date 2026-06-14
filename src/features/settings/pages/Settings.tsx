import { Head } from "@/components/seo/head";
import { SettingsPage } from "../components/SettingsPage";
import { UserDashboardContainer } from "@/components/hoc";

export function Settings() {
  return (
    <>
      <Head
        title="Settings"
        description="Configure your business preferences"
      />

      <UserDashboardContainer py="1.5rem">
        <SettingsPage />
      </UserDashboardContainer>
    </>
  );
}
