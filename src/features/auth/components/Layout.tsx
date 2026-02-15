import { LogoLoader } from "@/components/elements/loader/Loader";
import { Box } from "@chakra-ui/react";
import React, { type ReactNode, Suspense } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Box my={"2rem"}>Test Layout for Auth pages</Box>

      <Suspense
        fallback={
          <Box h={"100vh"}>
            <LogoLoader text="Loading..." />
          </Box>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
