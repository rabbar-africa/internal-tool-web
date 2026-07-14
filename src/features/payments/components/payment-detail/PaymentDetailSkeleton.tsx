import {
  Box,
  Flex,
  Grid,
  Skeleton,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";

/** Full-page skeleton mirroring the payment detail layout: header (back button
 * + title · actions) and the payment receipt card. */
export function PaymentDetailSkeleton() {
  return (
    <>
      {/* Header: back button + title/subtitle (left) · actions (right) */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
        mb="6"
      >
        <Flex align="center" gap="3">
          <Skeleton boxSize="9" rounded="lg" />
          <Stack gap="2">
            <Skeleton height="20px" width="160px" rounded="md" />
            <Skeleton height="12px" width="110px" rounded="md" />
          </Stack>
        </Flex>
        <Skeleton height="32px" width="32px" rounded="md" />
      </Flex>

      {/* Receipt card */}
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        shadow="sm"
        maxW="860px"
        mx="auto"
        w="100%"
        overflow="hidden"
        px={{ base: "6", md: "12" }}
        py={{ base: "8", md: "12" }}
      >
        {/* Org header: logo + name/address */}
        <Flex gap="6" align="flex-start" mb="10">
          <Skeleton boxSize="96px" rounded="md" flexShrink={0} />
          <Stack gap="2" pt="1" flex="1">
            <Skeleton height="20px" width="220px" rounded="md" />
            <SkeletonText noOfLines={2} gap="2" width="60%" />
          </Stack>
        </Flex>

        <Box borderTopWidth="1px" borderColor="gray.75" pt="8">
          {/* "PAYMENT RECEIPT" title */}
          <Flex justify="center" mb="8">
            <Skeleton height="14px" width="180px" rounded="md" />
          </Flex>

          {/* Details rows + amount box */}
          <Grid
            templateColumns={{ base: "1fr", md: "1.4fr 1fr" }}
            gap="8"
            mb="10"
          >
            <Stack gap="0">
              {Array.from({ length: 4 }).map((_, i) => (
                <Flex
                  key={i}
                  justify="space-between"
                  align="center"
                  gap="6"
                  py="3"
                  borderBottomWidth={i === 3 ? "0" : "1px"}
                  borderColor="gray.75"
                >
                  <Skeleton height="14px" width="120px" rounded="md" />
                  <Skeleton height="14px" width="90px" rounded="md" />
                </Flex>
              ))}
            </Stack>

            <Flex
              rounded="sm"
              direction="column"
              align="center"
              justify="center"
              gap="3"
              py={{ base: "6", md: "12" }}
              px="4"
              bg="gray.50"
              h="fit-content"
            >
              <Skeleton height="14px" width="120px" rounded="md" />
              <Skeleton height="24px" width="140px" rounded="md" />
            </Flex>
          </Grid>

          {/* Received from */}
          <Stack gap="2" mb="10">
            <Skeleton height="12px" width="100px" rounded="md" />
            <Skeleton height="18px" width="200px" rounded="md" />
          </Stack>

          {/* Payment for table */}
          <Stack gap="3">
            <Skeleton height="16px" width="120px" rounded="md" />
            <Box
              borderWidth="1px"
              borderColor="gray.75"
              rounded="lg"
              overflow="hidden"
            >
              <Grid
                templateColumns="1.2fr 1fr 1fr 1fr"
                bg="gray.50"
                px="4"
                py="2.5"
                gap="3"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="11px" rounded="md" />
                ))}
              </Grid>
              {Array.from({ length: 2 }).map((_, i) => (
                <Grid
                  key={i}
                  templateColumns="1.2fr 1fr 1fr 1fr"
                  px="4"
                  py="3.5"
                  gap="3"
                  borderTopWidth="1px"
                  borderColor="gray.75"
                  alignItems="center"
                >
                  {Array.from({ length: 4 }).map((__, j) => (
                    <Skeleton key={j} height="14px" rounded="md" />
                  ))}
                </Grid>
              ))}
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
