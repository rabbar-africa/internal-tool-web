import { Box, Grid, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { ICustomer } from "@/shared/interface/customer";

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Text
        fontSize="11px"
        color="gray.300"
        mb="1"
        fontWeight="500"
        letterSpacing="0.04em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="13.5px" color="gray.500">
        {value || "—"}
      </Text>
    </Box>
  );
}

interface CustomerInfoProps {
  customer: ICustomer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  const address =
    [customer.address, customer.city, customer.state, customer.country]
      .filter(Boolean)
      .join(", ") || null;

  return (
    <Box
      bg="white"
      rounded="xl"
      px={{ base: "5", md: "8" }}
      py="6"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
    >
      <Text
        fontSize="12px"
        fontWeight="600"
        color="gray.400"
        mb="5"
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        Contact & Details
      </Text>
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap="5"
      >
        <InfoField label="Email" value={customer.email} />
        <InfoField label="Phone" value={customer.phone} />
        <InfoField
          label="Type"
          value={
            customer.type ? (
              <Box
                display="inline-flex"
                bg="blue.50"
                px="8px"
                py="2px"
                rounded="full"
              >
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  color="blue.600"
                  textTransform="capitalize"
                >
                  {customer.type}
                </Text>
              </Box>
            ) : null
          }
        />
        <InfoField label="Company" value={customer.company} />
        <InfoField label="Job Title" value={customer.jobTitle} />
        <InfoField label="Address" value={address} />
      </Grid>
    </Box>
  );
}
