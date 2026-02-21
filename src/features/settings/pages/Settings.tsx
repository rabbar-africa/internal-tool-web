import { Head } from "@/components/seo/head";
import { SettingsPage } from "../components/SettingsPage";

export function Settings() {
  return (
    <>
      <Head
        title="Settings"
        description="Configure your business preferences"
      />
      <SettingsPage />
    </>
  );
}
