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
import { PoliceCarIcon } from "@/assets/custom";
import type { InspectionFormApi } from "./useInspectionForm";

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <Box>
      <Text
        mb=".375rem"
        textStyle="tiny-semibold"
        color="gray.300"
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        {label}
      </Text>
      <Text
        fontSize="0.875rem"
        color={value ? "gray.500" : "gray.200"}
        fontWeight="500"
      >
        {value || "—"}
      </Text>
    </Box>
  );
}

export function VehicleInfoSection({ form }: { form: InspectionFormApi }) {
  const { formik, selectedVehicle } = form;
  const { values, errors, touched, handleChange, handleBlur } = formik;

  const vehicleYear = selectedVehicle?.year ? String(selectedVehicle.year) : "";

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
              Inspection Details
            </Text>
            <Text textStyle="xs" color="gray.200">
              Vehicle details come from the selected vehicle
            </Text>
          </Box>
        </HStack>
      </Card.Header>
      <Card.Body>
        {values.vehicleId ? (
          <Box
            mb="5"
            p="4"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.50"
            bg="gray.50/50"
          >
            <Grid
              templateColumns={{
                base: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap="4"
            >
              <ReadOnlyField label="Vehicle" value={values.vehicleName} />
              <ReadOnlyField label="Reg. Number" value={values.vehicleNumber} />
              <ReadOnlyField label="Color" value={values.vehicleColor} />
              <ReadOnlyField label="Year" value={vehicleYear} />
            </Grid>
          </Box>
        ) : (
          <Box
            mb="5"
            p="4"
            rounded="lg"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="gray.100"
            bg="gray.50/40"
          >
            <Text fontSize="0.8rem" color="gray.300">
              Select a vehicle above to see its details here.
            </Text>
          </Box>
        )}

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <GridItem>
            <CustomInput
              label="Technician Name"
              placeholder="e.g. John Doe"
              name="technicianName"
              value={values.technicianName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.technicianName && errors.technicianName
                  ? errors.technicianName
                  : undefined
              }
            />
          </GridItem>
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
