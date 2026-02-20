import { Head } from "@/components/seo/head";
import { Box } from "@chakra-ui/react";
import { GenerateInspectionReportPage } from "../components/generate-inspection/GenerateInspectionReportPage";

export function GenerateInspection() {
  return (
    <>
      <Head
        title="Generate Inspection"
        description="Generate a new inspection"
      />
      <Box>
        <GenerateInspectionReportPage />
      </Box>
    </>
  );
}
