import { type FieldArrayRenderProps, useFormikContext } from "formik";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import { CustomInput, CustomSelect } from "@/components/input";
import type { InspectionFormValues } from "./inspection-form.types";
import { STATUS_OPTIONS } from "./inspection-form.types";

const asRegister = (name: string, handleChange: any, handleBlur: any) => ({
  name,
  onChange: handleChange as any,
  onBlur: handleBlur as any,
  ref: () => {},
});

interface FindingsSectionProps {
  arrayHelpers: FieldArrayRenderProps;
}

const EMPTY_FINDING = { component: "", observation: "", status: "" };

export function FindingsSection({ arrayHelpers }: FindingsSectionProps) {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormikContext<InspectionFormValues>();

  const findings = values.findings;

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Flex justify="space-between" align="center" w="full">
          <HStack gap="2">
            <Flex
              w="8"
              h="8"
              bg="primary.50"
              rounded="lg"
              align="center"
              justify="center"
            >
              <LuFileText color="var(--chakra-colors-primary-300)" />
            </Flex>
            <Box>
              <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                Inspection Findings
              </Text>
              <Text textStyle="xs" color="gray.200">
                Log each component inspected and its status
              </Text>
            </Box>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            borderColor="primary.300"
            color="primary.300"
            onClick={() => arrayHelpers.push(EMPTY_FINDING)}
          >
            <LuPlus />
            <Text display={{ base: "none", sm: "inline" }}>Add Finding</Text>
          </Button>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          {findings.map((_finding, index) => {
            const findingErrors = (
              errors.findings as
                | Array<Record<string, string> | undefined>
                | undefined
            )?.[index];
            const findingTouched = (
              touched.findings as
                | Array<Record<string, boolean> | undefined>
                | undefined
            )?.[index];

            return (
              <Box
                key={index}
                p="4"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.50"
                bg="gray.50/50"
              >
                {/* Finding number badge + delete */}
                <Flex justify="space-between" align="center" mb="3">
                  <HStack gap="2">
                    <Flex
                      w="6"
                      h="6"
                      bg="primary.300"
                      rounded="full"
                      align="center"
                      justify="center"
                    >
                      <Text color="white" fontSize="xs" fontWeight="700">
                        {index + 1}
                      </Text>
                    </Flex>
                    <Text fontSize=".8rem" fontWeight="600" color="gray.400">
                      Finding #{index + 1}
                    </Text>
                  </HStack>
                  {findings.length > 1 && (
                    <IconButton
                      aria-label="Remove finding"
                      size="xs"
                      variant="ghost"
                      color="error.300"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  )}
                </Flex>

                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <GridItem>
                    <CustomInput
                      label="Component"
                      placeholder="e.g. Spark Plugs"
                      required
                      register={asRegister(
                        `findings.${index}.component`,
                        handleChange,
                        handleBlur,
                      )}
                      value={findings[index].component}
                      error={
                        findingTouched?.component && findingErrors?.component
                          ? findingErrors.component
                          : undefined
                      }
                    />
                  </GridItem>
                  <GridItem>
                    <CustomSelect
                      label="Status"
                      placeholder="Select status"
                      required
                      options={STATUS_OPTIONS}
                      value={
                        findings[index].status ? [findings[index].status] : []
                      }
                      onChange={(val: any) => {
                        const v = Array.isArray(val?.value)
                          ? val.value[0]
                          : val?.value;
                        void setFieldValue(`findings.${index}.status`, v || "");
                      }}
                      error={
                        findingTouched?.status && findingErrors?.status
                          ? findingErrors.status
                          : undefined
                      }
                    />
                  </GridItem>
                </Grid>

                <Box mt="4">
                  <CustomInput
                    label="Observation Details"
                    placeholder="e.g. Faulty and require replacement"
                    register={asRegister(
                      `findings.${index}.observation`,
                      handleChange,
                      handleBlur,
                    )}
                    value={findings[index].observation}
                  />
                </Box>
              </Box>
            );
          })}

          {/* Quick add at bottom when many findings */}
          {findings.length >= 3 && (
            <Button
              variant="ghost"
              size="sm"
              color="primary.300"
              alignSelf="center"
              onClick={() => arrayHelpers.push(EMPTY_FINDING)}
            >
              <LuPlus /> Add Another Finding
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
