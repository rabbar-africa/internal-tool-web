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
import { CustomInput, CustomSelect } from "@/components/input";
import type { InspectionFormValues } from "./inspection-form.types";
import { TITLE_OPTIONS } from "./inspection-form.types";

const asRegister = (name: string, handleChange: any, handleBlur: any) => ({
  name,
  onChange: handleChange as any,
  onBlur: handleBlur as any,
  ref: () => {},
});

export function CustomerInfoSection() {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
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
            <Text color="primary.300" fontSize="sm" fontWeight="600">
              1
            </Text>
          </Flex>
          <Box>
            <Text fontWeight="600" color="gray.500" fontSize=".875rem">
              Customer Information
            </Text>
            <Text textStyle="xs" color="gray.200">
              Details of the vehicle owner
            </Text>
          </Box>
        </HStack>
      </Card.Header>
      <Card.Body>
        <Grid templateColumns={{ base: "1fr", md: "1fr 3fr" }} gap="4">
          <GridItem>
            <CustomSelect
              label="Title"
              placeholder="Select"
              required
              options={TITLE_OPTIONS}
              value={values.customerTitle ? [values.customerTitle] : []}
              onChange={(val: any) => {
                const v = Array.isArray(val?.value) ? val.value[0] : val?.value;
                void setFieldValue("customerTitle", v || "");
              }}
              error={
                touched.customerTitle && errors.customerTitle
                  ? errors.customerTitle
                  : undefined
              }
            />
          </GridItem>
          <GridItem>
            <CustomInput
              label="Full Name"
              placeholder="e.g. Funmilayo Ajangbadi"
              required
              register={asRegister("customerName", handleChange, handleBlur)}
              value={values.customerName}
              error={
                touched.customerName && errors.customerName
                  ? errors.customerName
                  : undefined
              }
            />
          </GridItem>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
