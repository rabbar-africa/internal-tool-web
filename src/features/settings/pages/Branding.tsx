import { SettingsSubPage } from "../components/SettingsSubPage";
import { LogoTab } from "../components/logo/LogoTab";

export function Branding() {
  return (
    <SettingsSubPage
      title="Logo & Branding"
      subtitle="Upload the logo shown on invoices and documents."
    >
      <LogoTab />
    </SettingsSubPage>
  );
}
