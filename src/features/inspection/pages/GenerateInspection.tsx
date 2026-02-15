import { Head } from "@/components/seo/head";
import { Box } from "@chakra-ui/react";
import { GenerateInspectionTemplate } from "../template/GenerateInspectionTemplate";
export function GenerateInspection() {
  return (
    <>
      <Head
        title="Generate Inspection"
        description="Generate a new inspection"
      />
      <Box>
        <GenerateInspectionTemplate />
      </Box>
    </>
  );
}
