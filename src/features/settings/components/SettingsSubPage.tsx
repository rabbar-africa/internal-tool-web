import type { ReactNode } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Head } from "@/components/seo/head";
import { CaretLeft } from "@/assets/custom/CaretLeft";
import { RouteConstants } from "@/shared/constants/routes";

interface SettingsSubPageProps {
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right of the header (e.g. an action button). */
  action?: ReactNode;
  children: ReactNode;
}

export function SettingsSubPage({
  title,
  subtitle,
  action,
  children,
}: SettingsSubPageProps) {
  const navigate = useNavigate();

  return (
    <>
      <Head title={`${title} · Settings`} description={subtitle} />
      <Stack gap="6">
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          gap="4"
          direction={{ base: "column", sm: "row" }}
        >
          <Flex align="center" gap="3">
            <Flex
              as="button"
              align="center"
              justify="center"
              boxSize="9"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.75"
              color="gray.400"
              bg="white"
              _hover={{ bg: "gray.50" }}
              cursor="pointer"
              flexShrink={0}
              onClick={() => navigate(RouteConstants.settings.base.path)}
              aria-label="Back to settings"
            >
              <CaretLeft boxSize="1rem" />
            </Flex>
            <Box>
              <Text textStyle="h3-bold" color="gray.500">
                {title}
              </Text>
              {subtitle && (
                <Text textStyle="small-regular" color="gray.300" mt="1">
                  {subtitle}
                </Text>
              )}
            </Box>
          </Flex>
          {action}
        </Flex>

        <Box
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          p={{ base: "4", md: "6" }}
        >
          {children}
        </Box>
      </Stack>
    </>
  );
}
