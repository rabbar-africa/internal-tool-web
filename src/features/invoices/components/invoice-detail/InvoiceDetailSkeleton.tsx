import {
  Box,
  Flex,
  Grid,
  Skeleton,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";

/** Full-page skeleton mirroring the invoice detail layout: header, connected
 * payments panel, and the invoice document card. */
export function InvoiceDetailSkeleton() {
  return (
    <Stack gap="6">
      {/* Header: breadcrumb + meta (left) · status + actions (right) */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="3"
      >
        <Stack gap="2">
          <Skeleton height="16px" width="200px" rounded="md" />
          <Skeleton height="12px" width="260px" rounded="md" />
        </Stack>
        <Flex align="center" gap="3">
          <Skeleton height="28px" width="90px" rounded="md" />
          <Skeleton height="32px" width="32px" rounded="md" />
        </Flex>
      </Flex>

      {/* Connected payments panel */}
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="md"
        shadow="sm"
        p={{ base: "4", md: "5" }}
      >
        <Skeleton height="14px" width="180px" rounded="md" mb="4" />
        <Stack gap="3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Flex key={i} justify="space-between" align="center" gap="4">
              <Skeleton height="14px" width="40%" rounded="md" />
              <Skeleton height="14px" width="80px" rounded="md" />
            </Flex>
          ))}
        </Stack>
      </Box>

      {/* Invoice document card */}
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="md"
        shadow="sm"
        px={{ base: "6", md: "12" }}
        py={{ base: "6", md: "12" }}
        maxW="900px"
        mx="auto"
        w="100%"
      >
        {/* Brand (left) + invoice/balance (right) */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" mb="10">
          <Stack gap="3">
            <Skeleton height="48px" width="140px" rounded="md" />
            <SkeletonText noOfLines={3} gap="2" width="70%" />
          </Stack>
          <Stack gap="3" align={{ base: "flex-start", md: "flex-end" }}>
            <Skeleton height="24px" width="120px" rounded="md" />
            <Skeleton height="14px" width="160px" rounded="md" />
            <Skeleton height="14px" width="140px" rounded="md" />
            <Skeleton height="56px" width="200px" rounded="md" mt="2" />
          </Stack>
        </Grid>

        {/* Bill-to block */}
        <Stack gap="2" mb="10">
          <Skeleton height="12px" width="80px" rounded="md" />
          <Skeleton height="16px" width="220px" rounded="md" />
          <SkeletonText noOfLines={2} gap="2" width="40%" />
        </Stack>

        {/* Line items table */}
        <Box borderWidth="1px" borderColor="gray.75" rounded="md" mb="8">
          <Flex bg="gray.50" px="4" py="3" justify="space-between" gap="4">
            <Skeleton height="12px" width="30%" rounded="md" />
            <Skeleton height="12px" width="60px" rounded="md" />
            <Skeleton height="12px" width="80px" rounded="md" />
            <Skeleton height="12px" width="80px" rounded="md" />
          </Flex>
          {Array.from({ length: 4 }).map((_, i) => (
            <Flex
              key={i}
              px="4"
              py="3.5"
              justify="space-between"
              gap="4"
              borderTopWidth="1px"
              borderColor="gray.75"
              align="center"
            >
              <Skeleton height="14px" width="30%" rounded="md" />
              <Skeleton height="14px" width="60px" rounded="md" />
              <Skeleton height="14px" width="80px" rounded="md" />
              <Skeleton height="14px" width="80px" rounded="md" />
            </Flex>
          ))}
        </Box>

        {/* Totals (right-aligned) */}
        <Flex justify="flex-end">
          <Stack gap="3" width={{ base: "100%", md: "300px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Flex key={i} justify="space-between" gap="4">
                <Skeleton height="14px" width="100px" rounded="md" />
                <Skeleton height="14px" width="90px" rounded="md" />
              </Flex>
            ))}
            <Flex
              justify="space-between"
              gap="4"
              pt="3"
              borderTopWidth="1px"
              borderColor="gray.75"
            >
              <Skeleton height="18px" width="120px" rounded="md" />
              <Skeleton height="18px" width="110px" rounded="md" />
            </Flex>
          </Stack>
        </Flex>

        {/* Notes / terms */}
        <Stack gap="3" mt="10">
          <Skeleton height="12px" width="90px" rounded="md" />
          <SkeletonText noOfLines={2} gap="2" width="60%" />
        </Stack>
      </Box>
    </Stack>
  );
}
