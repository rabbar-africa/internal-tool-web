import { Suspense, type ReactNode } from "react";
import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import logo from "@/assets/logo.png";

/** Minimal shell for the logged-out billing pages (pay link, Paystack return). */
export function BillingPublicLayout({ children }: { children: ReactNode }) {
  return (
    <Flex
      minH="100dvh"
      direction="column"
      align="center"
      bg="#F7F7F7"
      px={{ base: "1rem", md: "2rem" }}
      py={{ base: "2rem", md: "4rem" }}
    >
      <chakra.img
        src={logo}
        alt="Rabbar Africa"
        h="2rem"
        w="auto"
        objectFit="contain"
        mb="2rem"
      />
      <Box
        as="main"
        w="100%"
        maxW="28rem"
        bg="white"
        rounded="xl"
        borderWidth="1px"
        borderColor="gray.75"
        shadow="sm"
        p={{ base: "1.5rem", md: "2rem" }}
      >
        <Suspense fallback={<SectionLoader h="12rem" />}>{children}</Suspense>
      </Box>
      <Text fontSize="12px" color="gray.300" mt="1.5rem" textAlign="center">
        Payments are handled securely by Paystack.
      </Text>
    </Flex>
  );
}
