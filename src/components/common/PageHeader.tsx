import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", sm: "center" }}
      direction={{ base: "column", sm: "row" }}
      gap="3"
    >
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
      {action && <Box>{action}</Box>}
    </Flex>
  );
}
