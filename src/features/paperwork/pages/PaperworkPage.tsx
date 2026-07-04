import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { PaperworkTemplate } from "../template/PaperworkTemplate";

export function PaperworkPage() {
  return (
    <>
      <Head
        title="Paperwork"
        description="Track document expiries and store digital copies"
      />
      <UserDashboardContainer py="1.5rem">
        <PaperworkTemplate />
      </UserDashboardContainer>
    </>
  );
}
