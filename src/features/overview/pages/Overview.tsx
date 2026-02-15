import { Head } from "@/components/seo/head";
import { OverviewTemplate } from "../template/OverviewTemplate";
import { Box } from "@chakra-ui/react";
export function Overview() {
  return (
    <>
      <Head title="Overview" description="Overview of your account" />
      <Box>
        <OverviewTemplate />
      </Box>
    </>
  );
}
