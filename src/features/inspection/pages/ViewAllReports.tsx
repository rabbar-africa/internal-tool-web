import { Head } from "@/components/seo/head";
import { Box } from "@chakra-ui/react";
import { ViewAllReports } from "../components/view-all-reports/ViewAllReports";

export function ViewAllInspectionReports() {
  return (
    <>
      <Head
        title="Inspection Reports"
        description="View all inspection reports"
      />
      <Box>
        <ViewAllReports />
      </Box>
    </>
  );
}
