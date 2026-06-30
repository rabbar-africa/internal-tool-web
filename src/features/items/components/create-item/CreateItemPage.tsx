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
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateItemMutation } from "../../api/query";
import type { CreateItemPayload, ItemType } from "@/shared/interface/item";

const validationSchema = Yup.object({
  name: Yup.string().required("Item name is required"),
  unitPrice: Yup.string().required("Price is required"),
  description: Yup.string(),
  type: Yup.string(),
  unit: Yup.string(),
});

const TYPE_OPTIONS: { label: string; value: ItemType }[] = [
  { label: "Product", value: "product" },
  { label: "Service", value: "service" },
];

const UNIT_OPTIONS = [
  { label: "Each (unit)", value: "each" },
  { label: "Hour (hr)", value: "hr" },
  { label: "Day", value: "day" },
  { label: "Kilometre (km)", value: "km" },
  { label: "Litre (L)", value: "L" },
  { label: "Set", value: "set" },
  { label: "Job", value: "job" },
];

const initialValues = {
  name: "",
  unitPrice: "",
  // Optional fields — visible but pre-initialized with sensible defaults.
  description: "",
  type: "product" as ItemType,
  unit: "each",
};

export function CreateItemPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateItemMutation();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload: CreateItemPayload = {
        name: values.name,
        description: values.description || undefined,
        productType: values.type
          ? (values.type.toUpperCase() as "PRODUCT" | "SERVICE")
          : undefined,
        unit: values.unit || undefined,
        rate: Number(values.unitPrice),
        status: "ACTIVE",
      };
      await mutateAsync(payload);
      navigate(RouteConstants.items.base.path);
    },
  });

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

        <form onSubmit={formik.handleSubmit}>
          <Stack gap="5">
            {/* Section 1: Basic Info */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
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
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Engine Oil Change"
                      error={
                        formik.touched.name && formik.errors.name
                          ? formik.errors.name
                          : undefined
                      }
                    />
                    <CustomSelect
                      label="Type"
                      options={TYPE_OPTIONS}
                      placeholder="Select type..."
                      value={
                        formik.values.type ? [formik.values.type] : undefined
                      }
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue("type", opt?.value?.[0] ?? "");
                      }}
                      error={
                        formik.touched.type && formik.errors.type
                          ? formik.errors.type
                          : undefined
                      }
                    />
                  </Grid>
                  <CustomInput
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Brief description of this item or service"
                  />
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Section 2: Pricing */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
              <Card.Header pb="0">
                {sectionHeader(2, "Pricing", "Unit price and measure")}
              </Card.Header>
              <Card.Body>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <CustomSelect
                    label="Unit of Measure"
                    options={UNIT_OPTIONS}
                    placeholder="Select unit..."
                    value={
                      formik.values.unit ? [formik.values.unit] : undefined
                    }
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue("unit", opt?.value?.[0] ?? "");
                    }}
                    error={
                      formik.touched.unit && formik.errors.unit
                        ? formik.errors.unit
                        : undefined
                    }
                  />
                  <CustomNumberInput
                    label="Price (₦)"
                    required
                    placeholder="0.00"
                    value={formik.values.unitPrice}
                    onValueChange={(raw) =>
                      formik.setFieldValue("unitPrice", raw)
                    }
                    onBlur={formik.handleBlur}
                    name="unitPrice"
                    error={
                      formik.touched.unitPrice && formik.errors.unitPrice
                        ? String(formik.errors.unitPrice)
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
              <Button type="submit" loading={isPending} loadingText="Saving...">
                Add Item
              </Button>
            </Flex>
          </Stack>
        </form>
      </Stack>
    </UserDashboardContainer>
  );
}
