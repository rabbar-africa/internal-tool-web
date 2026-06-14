import { LogoLoader } from "@/components/elements/loader/Loader";
import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex
      h={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      bg={"gray.50"}
      px={"1rem"}
    >
      <Suspense
        fallback={
          <Box h={"100vh"}>
            <LogoLoader text="Loading..." />
          </Box>
        }
      >
        {children}
      </Suspense>
    </Flex>
  );
}
