import { Box, Text } from "@chakra-ui/react";

export function InfoField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="10.5px"
        color="gray.300"
        mb="1"
        fontWeight="600"
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="13.5px" color="gray.500" fontWeight="500">
        {value || "—"}
      </Text>
    </Box>
  );
}
