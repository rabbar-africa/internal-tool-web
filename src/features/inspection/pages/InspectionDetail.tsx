import { Head } from "@/components/seo/head";
import { Box } from "@chakra-ui/react";
import { InspectionDetailPage } from "../components/inspection-detail/InspectionDetailPage";

export function InspectionDetail() {
  return (
    <>
      <Head
        title="Inspection Detail"
        description="View inspection report details"
      />
      <Box>
        <InspectionDetailPage />
      </Box>
    </>
  );
}
