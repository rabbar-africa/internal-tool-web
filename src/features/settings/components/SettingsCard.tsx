import type { ComponentType } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export interface SettingsCardItem {
  title: string;
  description: string;
  icon: ComponentType<any>;
  href: string;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  href,
}: SettingsCardItem) {
  const navigate = useNavigate();

  return (
    <Flex
      as="button"
      textAlign="left"
      align="flex-start"
      gap="3"
      p="3"
      rounded="lg"
      cursor="pointer"
      transition="background 0.15s"
      _hover={{ bg: "gray.75" }}
      onClick={() => navigate(href)}
      bg={"white"}
      w="100%"
    >
      <Flex
        align="center"
        justify="center"
        boxSize="9"
        rounded="lg"
        bg="primary.50"
        color="primary.400"
        flexShrink={0}
      >
        <Icon boxSize="1.125rem" />
      </Flex>
      <Box>
        <Text fontSize="14px" fontWeight="600" color="primary.400">
          {title}
        </Text>
        <Text fontSize="12px" color="gray.300" mt="0.5" lineHeight="1.5">
          {description}
        </Text>
      </Box>
    </Flex>
  );
}
