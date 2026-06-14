import type { ReactNode } from "react";
import { Box, Card, Flex, HStack, Text } from "@chakra-ui/react";

interface SectionCardProps {
  step: number;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  step,
  title,
  subtitle,
  action,
  children,
}: SectionCardProps) {
  return (
    <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
      <Card.Header pb="0">
        <Flex justify="space-between" align="flex-start" gap="3">
          <HStack gap="2.5">
            <Flex
              w="8"
              h="8"
              bg="primary.50"
              rounded="lg"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Text color="primary.300" fontSize="sm" fontWeight="600">
                {step}
              </Text>
            </Flex>
            <Box>
              <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                {title}
              </Text>
              {subtitle && (
                <Text textStyle="xs" color="gray.200">
                  {subtitle}
                </Text>
              )}
            </Box>
          </HStack>
          {action}
        </Flex>
      </Card.Header>
      <Card.Body pt="4">{children}</Card.Body>
    </Card.Root>
  );
}
