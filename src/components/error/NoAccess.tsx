import { Button, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Lock } from "@/assets/custom/Lock";
import { RouteConstants } from "@/shared/constants/routes";
import { Head } from "../seo/head";

/**
 * Shown in place of a page the user's roles don't allow. It renders inside the
 * app shell and keeps the URL, so the sidebar still works and the link can be
 * sent to an admin as-is.
 */
export function NoAccess() {
  const navigate = useNavigate();

  return (
    <>
      <Head
        title="No access"
        description="Your role doesn't include this page."
      />
      <Center minH="60vh" px="4" py="12">
        <Stack gap="5" align="center" textAlign="center" maxW="400px">
          <Center w="14" h="14" rounded="full" bg="gray.50" color="#293885">
            <Lock w="1.25rem" h="1.25rem" aria-hidden="true" />
          </Center>

          <Stack gap="2" align="center">
            <Text fontSize="20px" fontWeight="700" color="gray.500">
              You don&apos;t have access to this page
            </Text>
            <Text fontSize="14px" color="gray.400">
              Your role doesn&apos;t include it. If you need it for your work,
              ask an admin on your team to update your role.
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
            <Button onClick={() => navigate(RouteConstants.overview.base.path)}>
              Go to Dashboard
            </Button>
          </Flex>
        </Stack>
      </Center>
    </>
  );
}
