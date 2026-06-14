import { UserDashboardContainer } from "@/components/hoc";
import { SettingsSubPage } from "../components/SettingsSubPage";
import { Profile } from "../components/profile/Profile";

export function CompanyProfile() {
  return (
    <UserDashboardContainer py={"1.5rem"}>
      <SettingsSubPage
        title="Company Profile"
        subtitle="Business name, contact details, and registration info."
      >
        <Profile />
      </SettingsSubPage>
    </UserDashboardContainer>
  );
}
