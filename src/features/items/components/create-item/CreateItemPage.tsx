import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateItemMutation } from "../../api/query";
import type { CreateItemPayload, ItemType } from "@/shared/interface/item";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  type: Yup.string().required("Type is required"),
  unit: Yup.string().required("Unit is required"),
  unitPrice: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Unit price is required"),
  taxRate: Yup.number().min(0).max(100, "Tax rate must be 0–100"),
});

const typeOptions: { label: string; value: ItemType }[] = [
  { label: "Product", value: "product" },
  { label: "Service", value: "service" },
];

const unitOptions = [
  { label: "Each (unit)", value: "each" },
  { label: "Hour (hr)", value: "hr" },
  { label: "Day", value: "day" },
  { label: "Kilometre (km)", value: "km" },
  { label: "Litre (L)", value: "L" },
  { label: "Set", value: "set" },
  { label: "Job", value: "job" },
];

export function CreateItemPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateItemMutation();

  const initialValues = {
    name: "",
    description: "",
    type: "" as ItemType | "",
    unit: "",
    unitPrice: "",
    taxRate: "7.5",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const payload: CreateItemPayload = {
      name: values.name,
      description: values.description || undefined,
      type: values.type as ItemType,
      unit: values.unit,
      unitPrice: Number(values.unitPrice),
      taxRate: Number(values.taxRate),
    };
    await mutateAsync(payload);
    navigate(RouteConstants.items.base.path);
  };

  const sectionHeader = (num: number, title: string, subtitle?: string) => (
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
          {num}
        </Text>
      </Flex>
      <Box>
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.200">
            {subtitle}
          </Text>
        )}
      </Box>
    </HStack>
  );

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              Add Item / Service
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Add a new product or service for use in invoices
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.items.base.path)}
          >
            Cancel
          </Button>
        </Flex>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue }) => {
            return (
              <Form>
                <Stack gap="5">
                  {/* Section 1: Basic Info */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        1,
                        "Basic Information",
                        "Item details and classification",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Stack gap="4">
                        <Grid
                          templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                          gap="4"
                        >
                          <CustomInput
                            label="Item Name"
                            required
                            // register={asRegister("name")}
                            // defaultValue={values.name}
                            placeholder="e.g. Engine Oil Change"
                            error={
                              touched.name && errors.name
                                ? errors.name
                                : undefined
                            }
                          />
                          <CustomSelect
                            label="Type"
                            required
                            options={typeOptions}
                            placeholder="Select type..."
                            // value={typeOptions.find((o) => o.value === values.type) ?? null}
                            onChange={(opt) => {
                              const selected = opt as {
                                value: ItemType;
                              } | null;
                              setFieldValue("type", selected?.value ?? "");
                            }}
                            error={
                              touched.type && errors.type
                                ? errors.type
                                : undefined
                            }
                          />
                        </Grid>
                        <CustomTextArea
                          label="Description"
                          placeholder="Brief description of this item or service..."
                          // register={asTextAreaRegister("description") as Parameters<typeof CustomTextArea>[0]["register"]}
                          // defaultValue={values.description}
                        />
                      </Stack>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Pricing */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        2,
                        "Pricing",
                        "Unit price and tax configuration",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }}
                        gap="4"
                      >
                        <CustomSelect
                          label="Unit of Measure"
                          required
                          options={unitOptions}
                          placeholder="Select unit..."
                          // value={unitOptions.find((o) => o.value === values.unit) ?? null}
                          onChange={(opt) => {
                            const selected = opt as { value: string } | null;
                            setFieldValue("unit", selected?.value ?? "");
                          }}
                          error={
                            touched.unit && errors.unit
                              ? errors.unit
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Unit Price (₦)"
                          // type="number"
                          required
                          // register={asRegister("unitPrice")}
                          // defaultValue={String(values.unitPrice)}
                          placeholder="0.00"
                          error={
                            touched.unitPrice && errors.unitPrice
                              ? errors.unitPrice
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Tax Rate (%)"
                          // type="number"
                          // register={asRegister("taxRate")}
                          // defaultValue={String(values.taxRate)}
                          placeholder="7.5"
                          error={
                            touched.taxRate && errors.taxRate
                              ? errors.taxRate
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  <Flex justify="flex-end" gap="3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(RouteConstants.items.base.path)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Saving..."
                    >
                      Add Item
                    </Button>
                  </Flex>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Stack>
    </UserDashboardContainer>
  );
}
