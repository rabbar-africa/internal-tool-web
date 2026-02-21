import { useFormikContext } from "formik";
import {
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input";
import type { InspectionFormValues } from "./inspection-form.types";
import { PoliceCarIcon } from "@/assets/custom";

const asRegister = (name: string, handleChange: any, handleBlur: any) => ({
  name,
  onChange: handleChange as any,
  onBlur: handleBlur as any,
  ref: () => {},
});

export function VehicleInfoSection() {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<InspectionFormValues>();

  const fieldProps = (name: keyof InspectionFormValues) => ({
    register: asRegister(name, handleChange, handleBlur),
    value: values[name] as string,
    error: touched[name] && errors[name] ? (errors[name] as string) : undefined,
  });

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <HStack gap="2">
          <Flex
            w="8"
            h="8"
            bg="primary.50"
            rounded="lg"
            align="center"
            justify="center"
          >
            <PoliceCarIcon color="var(--chakra-colors-primary-300)" />
          </Flex>
          <Box>
            <Text fontWeight="600" color="gray.500" fontSize=".875rem">
              Vehicle Information
            </Text>
            <Text textStyle="xs" color="gray.200">
              Identification details for the vehicle
            </Text>
          </Box>
        </HStack>
      </Card.Header>
      <Card.Body>
        <Grid
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }}
          gap="4"
        >
          <GridItem>
            <CustomInput
              label="Vehicle Number"
              placeholder="e.g. 3D8 4KAJ"
              required
              {...fieldProps("vehicleNumber")}
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Vehicle Name"
              placeholder="e.g. Toyota Camry"
              required
              {...fieldProps("vehicleName")}
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Color"
              placeholder="e.g. Deep Red"
              required
              {...fieldProps("vehicleColor")}
            />
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4" mt="4">
          <GridItem>
            <CustomInput
              label="Job Code"
              placeholder="e.g. RAB/TOYCAM/3D84KAJ"
              required
              {...fieldProps("jobCode")}
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Inspection Date"
              type="date"
              required
              {...fieldProps("inspectionDate")}
            />
          </GridItem>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
