import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useUpdateCustomerMutation } from "../../api/query";
import { removeFalsyAndEmptyArrayFields } from "@/utils/object-formatter";

interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  stage: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

interface EditCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerRow;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  displayName: Yup.string().required("Display name is required"),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string(),
  stage: Yup.string().required("Stage is required"),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  country: Yup.string(),
});

const STAGE_OPTIONS = [
  { label: "Prospect", value: "PROSPECT" },
  { label: "Lead", value: "LEAD" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Returning Customer", value: "RETURNING_CUSTOMER" },
  { label: "Inactive", value: "INACTIVE" },
];

export function EditCustomerModal({
  open,
  onClose,
  customer,
}: EditCustomerModalProps) {
  const { mutateAsync, isPending } = useUpdateCustomerMutation(customer.id);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      displayName: customer.displayName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      stage: customer.stage ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      country: customer.country ?? "Nigeria",
    },
    validationSchema,
    onSubmit: async (values) => {
      await mutateAsync(
        removeFalsyAndEmptyArrayFields({
          firstName: values.firstName,
          lastName: values.lastName,
          displayName: values.displayName,
          email: values.email,
          phone: values.phone,
          stage: values.stage,
          address: values.address || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          country: values.country,
        }),
      );
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const displayNameOptions =
    formik.values.firstName.trim() && formik.values.lastName.trim()
      ? [
          {
            label: `${formik.values.firstName} ${formik.values.lastName}`,
            value: `${formik.values.firstName} ${formik.values.lastName}`,
          },
          {
            label: `${formik.values.lastName} ${formik.values.firstName}`,
            value: `${formik.values.lastName} ${formik.values.firstName}`,
          },
          {
            label: formik.values.displayName,
            value: formik.values.displayName,
          },
        ]
      : [];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) handleClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="520px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Edit Customer
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="First Name"
                      required
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Emeka"
                      error={
                        formik.touched.firstName && formik.errors.firstName
                          ? formik.errors.firstName
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Last Name"
                      required
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Okafor"
                      error={
                        formik.touched.lastName && formik.errors.lastName
                          ? formik.errors.lastName
                          : undefined
                      }
                    />
                  </Grid>

                  <CustomSelect
                    label="Display Name"
                    required
                    options={displayNameOptions}
                    placeholder="Select name format..."
                    value={
                      formik.values.displayName
                        ? [formik.values.displayName]
                        : undefined
                    }
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue(
                        "displayName",
                        opt?.value?.[0] ?? "",
                      );
                    }}
                    error={
                      formik.touched.displayName && formik.errors.displayName
                        ? formik.errors.displayName
                        : undefined
                    }
                  />

                  <CustomSelect
                    label="Stage"
                    required
                    options={STAGE_OPTIONS}
                    placeholder="Select stage..."
                    value={
                      formik.values.stage ? [formik.values.stage] : undefined
                    }
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue("stage", opt?.value?.[0] ?? "");
                    }}
                    error={
                      formik.touched.stage && formik.errors.stage
                        ? formik.errors.stage
                        : undefined
                    }
                  />

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. emeka@company.com"
                      error={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Phone Number"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. +234 801 234 5678"
                      error={
                        formik.touched.phone && formik.errors.phone
                          ? formik.errors.phone
                          : undefined
                      }
                    />
                  </Grid>

                  <CustomInput
                    label="Street Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. 12 Allen Avenue"
                  />

                  <Grid templateColumns="1fr 1fr 1fr" gap="4">
                    <CustomInput
                      label="City"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Lagos"
                    />
                    <CustomInput
                      label="State"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Lagos State"
                    />
                    <CustomInput
                      label="Country"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Nigeria"
                    />
                  </Grid>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isPending}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                </Flex>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
