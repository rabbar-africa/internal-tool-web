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
import { RouteConstants } from "@/shared/constants/routes";
import { useCreateCustomerMutation } from "../../api/query";
import type {
  CreateCustomerPayload,
  CustomerType,
} from "@/shared/interface/customer";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  type: Yup.string().required("Customer type is required"),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  country: Yup.string().required("Country is required"),
});

const typeOptions: { label: string; value: CustomerType }[] = [
  { label: "Individual", value: "individual" },
  { label: "Company / Business", value: "company" },
];

export function CreateCustomerPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCustomerMutation();

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    type: "" as CustomerType | "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const payload: CreateCustomerPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      type: values.type as CustomerType,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      country: values.country,
    };
    await mutateAsync(payload);
    navigate(RouteConstants.customers.base.path);
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
              Add Customer
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Add a new customer to your database
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.customers.base.path)}
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
            // const asRegister = (name: string) => ({
            //   name,
            //   onChange: handleChange as React.ChangeEventHandler<HTMLInputElement>,
            //   onBlur: handleBlur as React.FocusEventHandler<HTMLInputElement>,
            //   ref: () => {},
            // });

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
                        "Customer contact details",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <CustomInput
                          label="Full Name / Company Name"
                          required
                          // register={asRegister("name")}
                          // defaultValue={values.name}
                          placeholder="e.g. Adewale Okonkwo"
                          error={
                            touched.name && errors.name
                              ? errors.name
                              : undefined
                          }
                        />
                        <CustomSelect
                          label="Customer Type"
                          required
                          options={typeOptions}
                          placeholder="Select type..."
                          // value={typeOptions.find((o) => o.value === values.type) ?? null}
                          onChange={(opt) => {
                            const selected = opt as {
                              value: CustomerType;
                            } | null;
                            setFieldValue("type", selected?.value ?? "");
                          }}
                          error={
                            touched.type && errors.type
                              ? errors.type
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Email Address"
                          type="email"
                          required
                          // register={asRegister("email")}
                          // defaultValue={values.email}
                          placeholder="e.g. adewale@company.com"
                          error={
                            touched.email && errors.email
                              ? errors.email
                              : undefined
                          }
                        />
                        <CustomInput
                          label="Phone Number"
                          required
                          // register={asRegister("phone")}
                          // defaultValue={values.phone}
                          placeholder="e.g. +234 801 234 5678"
                          error={
                            touched.phone && errors.phone
                              ? errors.phone
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  {/* Section 2: Address */}
                  <Card.Root
                    borderWidth="1px"
                    borderColor="gray.75"
                    shadow="none"
                  >
                    <Card.Header pb="0">
                      {sectionHeader(
                        2,
                        "Address",
                        "Optional location information",
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Grid
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="4"
                      >
                        <Box gridColumn={{ sm: "1 / -1" }}>
                          <CustomInput
                            label="Street Address"
                            // register={asRegister("address")}
                            // defaultValue={values.address ?? ""}
                            placeholder="e.g. 12 Allen Avenue"
                          />
                        </Box>
                        <CustomInput
                          label="City"
                          // register={asRegister("city")}
                          // defaultValue={values.city ?? ""}
                          placeholder="e.g. Lagos"
                        />
                        <CustomInput
                          label="State"
                          // register={asRegister("state")}
                          // defaultValue={values.state ?? ""}
                          placeholder="e.g. Lagos State"
                        />
                        <CustomInput
                          label="Country"
                          required
                          // register={asRegister("country")}
                          // defaultValue={values.country}
                          error={
                            touched.country && errors.country
                              ? errors.country
                              : undefined
                          }
                        />
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  <Flex justify="flex-end" gap="3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(RouteConstants.customers.base.path)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Saving..."
                    >
                      Add Customer
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
