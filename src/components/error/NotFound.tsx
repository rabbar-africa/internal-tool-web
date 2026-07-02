import { Box, Button, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../common/Logo";
import { Head } from "../seo/head";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Head title="Page not found" description="This page does not exist." />
      <Center
        minH="100dvh"
        bg="#F7F7F7"
        px="6"
        position="relative"
        overflow="hidden"
      >
        {/* Soft brand blob, echoing the route-error screen. */}
        <Box
          position="absolute"
          bottom="-40"
          right="-40"
          w="420px"
          h="420px"
          opacity={0.06}
          pointerEvents="none"
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#293885"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,74.1,43.2C66.7,57.2,57.6,70.6,45,78.1C32.4,85.6,16.2,87.1,0.7,85.9C-14.8,84.7,-29.6,80.9,-43.9,74.4C-58.3,67.9,-72,58.7,-79.8,45.9C-87.7,33,-89.5,16.5,-88.9,0.3C-88.4,-15.9,-85.4,-31.7,-78.1,-45.4C-70.8,-59.1,-59.1,-70.6,-45.3,-77.9C-31.6,-85.3,-15.8,-88.5,-0.3,-88.1C15.3,-87.6,30.5,-83.5,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </Box>

        <Stack
          gap="6"
          align="center"
          textAlign="center"
          maxW="440px"
          position="relative"
        >
          <Logo />

          <Text
            fontSize={{ base: "80px", md: "112px" }}
            fontWeight="800"
            lineHeight="1"
            color="#293885"
            letterSpacing="-0.03em"
          >
            404
          </Text>

          <Stack gap="2" align="center">
            <Text fontSize="20px" fontWeight="700" color="gray.500">
              Page not found
            </Text>
            <Text fontSize="14px" color="gray.400" maxW="360px">
              The page you&apos;re looking for doesn&apos;t exist or may have
              been moved.
            </Text>
          </Stack>

          <Flex
            gap="3"
            direction={{ base: "column", sm: "row" }}
            w="full"
            justify="center"
          >
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </Flex>
        </Stack>
      </Center>
    </>
  );
}
