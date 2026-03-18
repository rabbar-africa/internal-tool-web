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

export function VehicleInfoSection() {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<InspectionFormValues>();

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
              name="vehicleNumber"
              value={values.vehicleNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.vehicleNumber && errors.vehicleNumber
                  ? errors.vehicleNumber
                  : undefined
              }
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Vehicle Name"
              placeholder="e.g. Toyota Camry"
              required
              name="vehicleName"
              value={values.vehicleName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.vehicleName && errors.vehicleName
                  ? errors.vehicleName
                  : undefined
              }
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Color"
              placeholder="e.g. Deep Red"
              required
              name="vehicleColor"
              value={values.vehicleColor}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.vehicleColor && errors.vehicleColor
                  ? errors.vehicleColor
                  : undefined
              }
            />
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: "1fr" }} gap="4" mt="4">
          <GridItem>
            <CustomInput
              label="Inspection Date"
              type="date"
              required
              name="inspectionDate"
              value={values.inspectionDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.inspectionDate && errors.inspectionDate
                  ? errors.inspectionDate
                  : undefined
              }
            />
          </GridItem>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
