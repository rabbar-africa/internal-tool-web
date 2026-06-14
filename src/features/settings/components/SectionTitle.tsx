import { Box, Text } from "@chakra-ui/react";

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box mb="4">
      <Text fontWeight="600" fontSize="15px" color="gray.500">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="12px" color="gray.300" mt="0.5">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
