import { Head } from "@/components/seo/head";
import { Box } from "@chakra-ui/react";

export function OverviewTemplate() {
  return (
    <>
      <Head title="Overview" description="Overview of your account" />
      <Box>this is overview</Box>
    </>
  );
}
