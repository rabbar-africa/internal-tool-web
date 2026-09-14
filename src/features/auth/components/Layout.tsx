import { LogoLoader } from "@/components/elements/loader/Loader";
import { Box, Flex, Stack, Text, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import whiteLogo from "@/assets/white-logo.png";

/**
 * Proof points on the brand panel. Kept in step with the marketing site's
 * Jobcard hero (rabbar.africa/jobcard) so signing in feels like the same
 * product the visitor just read about.
 */
const HIGHLIGHTS = [
  "Job cards and photo-backed inspections, worked from the phone in your pocket",
  "AI-drafted customer advisories your technician edits before they go out",
  "A straight answer to which car actually made you money",
];

/** The pill badge from the marketing hero, reused in both breakpoints. */
function ProductBadge() {
  return (
    <Flex
      display="inline-flex"
      align="center"
      gap="2"
      rounded="full"
      borderWidth="1px"
      borderColor="whiteAlpha.300"
      bg="whiteAlpha.100"
      px="3"
      py="1"
    >
      <Text fontSize="13px" fontWeight="600" color="secondary.300">
        Jobcard
      </Text>
      <Text fontSize="13px" color="whiteAlpha.700">
        by Rabbar Africa
      </Text>
    </Flex>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex
      minH="100vh"
      direction={{ base: "column", lg: "row" }}
      // Navy ground so the mobile sheet has something branded to sit on, and
      // any overscroll past the form reads as brand rather than blank white.
      bg="primary.500"
    >
      {/* ── Brand panel — desktop ──────────────────────────────────────── */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        direction="column"
        justify="space-between"
        w="42%"
        maxW="34rem"
        position="relative"
        overflow="hidden"
        px="3.5rem"
        py="3rem"
      >
        <Box
          aria-hidden="true"
          position="absolute"
          top="-10rem"
          right="-12rem"
          w="32rem"
          h="32rem"
          rounded="full"
          bg="secondary.300"
          opacity={0.12}
          filter="blur(90px)"
          pointerEvents="none"
        />

        <Box position="relative">
          <chakra.img
            src={whiteLogo}
            alt="Rabbar Africa"
            h="1.75rem"
            w="auto"
            objectFit="contain"
          />
        </Box>

        <Box position="relative">
          <Box mb="1.75rem">
            <ProductBadge />
          </Box>

          <Text
            as="h2"
            fontSize="2.125rem"
            lineHeight="1.15"
            fontWeight="700"
            letterSpacing="-0.02em"
            color="white"
          >
            Run your workshop off your phone, not a{" "}
            <Text as="span" color="secondary.300">
              carbon-copy pad
            </Text>
            .
          </Text>

          <Stack gap="3.5" mt="2.25rem">
            {HIGHLIGHTS.map((point) => (
              <Flex key={point} gap="3" align="flex-start">
                <Box
                  flexShrink={0}
                  mt="0.5rem"
                  w="6px"
                  h="6px"
                  rounded="2px"
                  bg="secondary.300"
                />
                <Text
                  fontSize="0.9375rem"
                  lineHeight="1.55"
                  color="whiteAlpha.800"
                >
                  {point}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>

        <Text position="relative" fontSize="12px" color="whiteAlpha.600">
          © {new Date().getFullYear()} Rabbar Africa
        </Text>
      </Flex>

      {/* ── Brand header — mobile and tablet ───────────────────────────── */}
      <Box
        display={{ base: "block", lg: "none" }}
        position="relative"
        overflow="hidden"
        px="1.5rem"
        pt="2.75rem"
        pb="3.25rem"
      >
        <Box
          aria-hidden="true"
          position="absolute"
          top="-9rem"
          right="-9rem"
          w="20rem"
          h="20rem"
          rounded="full"
          bg="secondary.300"
          opacity={0.14}
          filter="blur(70px)"
          pointerEvents="none"
        />

        <Box position="relative">
          <chakra.img
            src={whiteLogo}
            alt="Rabbar Africa"
            h="1.5rem"
            w="auto"
            objectFit="contain"
          />

          <Text
            as="h2"
            mt="1.5rem"
            fontSize={{ base: "1.5rem", sm: "1.75rem" }}
            lineHeight="1.2"
            fontWeight="700"
            letterSpacing="-0.02em"
            color="white"
            maxW="22rem"
          >
            Run your workshop off your phone, not a{" "}
            <Text as="span" color="secondary.300">
              carbon-copy pad
            </Text>
            .
          </Text>

          <Box mt="1.25rem">
            <ProductBadge />
          </Box>
        </Box>
      </Box>

      {/* ── Form column ────────────────────────────────────────────────── */}
      <Flex
        flex="1"
        direction="column"
        align="center"
        justify={{ base: "flex-start", lg: "center" }}
        bg="white"
        // On mobile the form is a sheet lifted over the navy header; on
        // desktop it is simply the right-hand column.
        roundedTop={{ base: "1.5rem", lg: "0" }}
        mt={{ base: "-1.5rem", lg: "0" }}
        position="relative"
        // Steps slide in horizontally; clip so a mid-animation step can't
        // widen the page and make it wobble sideways on phones. `clip`, not
        // `hidden`, so this doesn't become a scroll container.
        overflowX="clip"
        px={{ base: "1.25rem", md: "2.5rem" }}
        pt={{ base: "2.5rem", lg: "3rem" }}
        pb={{ base: "3rem", lg: "3rem" }}
      >
        <Suspense fallback={<LogoLoader text="Loading..." />}>
          {children}
        </Suspense>
      </Flex>
    </Flex>
  );
}
