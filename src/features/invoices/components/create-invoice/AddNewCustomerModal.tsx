import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import type { Customer } from "@/shared/interface/customer";

interface AddNewCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Customer name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
});

const TYPE_OPTIONS = [
  { label: "Individual", value: "individual" },
  { label: "Company", value: "company" },
];

export function AddNewCustomerModal({
  open,
  onClose,
  onSave,
}: AddNewCustomerModalProps) {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      type: "individual" as "individual" | "company",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const customer: Customer = {
        id: `cust-custom-${Date.now()}`,
        code: `C-${Date.now()}`,
        name: values.name,
        email: values.email,
        phone: values.phone,
        type: values.type,
        status: "active",
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        country: values.country,
        totalInvoices: 0,
        totalRevenue: 0,
        outstandingBalance: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      onSave(customer);
      resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

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
          <Dialog.Content maxW="480px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Add New Customer
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  <CustomInput
                    label="Customer Name"
                    placeholder="e.g. Emeka Okafor"
                    required
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.name && formik.errors.name
                        ? formik.errors.name
                        : undefined
                    }
                  />
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Email"
                      placeholder="email@example.com"
                      required
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Phone"
                      placeholder="+234 800 000 0000"
                      required
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.phone && formik.errors.phone
                          ? formik.errors.phone
                          : undefined
                      }
                    />
                  </Grid>
                  <CustomSelect
                    label="Type"
                    options={TYPE_OPTIONS}
                    value={[formik.values.type]}
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue(
                        "type",
                        opt?.value?.[0] ?? "individual",
                      );
                    }}
                  />
                  <CustomInput
                    label="Address"
                    placeholder="Street address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Grid templateColumns="1fr 1fr 1fr" gap="4">
                    <CustomInput
                      label="City"
                      placeholder="Lagos"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <CustomInput
                      label="State"
                      placeholder="Lagos"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <CustomInput
                      label="Country"
                      placeholder="Nigeria"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Grid>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={formik.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={formik.isSubmitting}>
                    Save Customer
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
