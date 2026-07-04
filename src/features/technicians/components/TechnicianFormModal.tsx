import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSwitch } from "@/components/input/CustomSwitch";
import type { Technician } from "@/shared/interface/technician";
import {
  useCreateTechnicianMutation,
  useUpdateTechnicianMutation,
} from "../api/query";

interface TechnicianFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set the modal edits this technician; otherwise it creates a new one. */
  technician?: Technician | null;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string(),
  phone: Yup.string(),
  email: Yup.string().email("Enter a valid email"),
  specialty: Yup.string(),
});

export function TechnicianFormModal({
  open,
  onClose,
  technician,
}: TechnicianFormModalProps) {
  const isEdit = Boolean(technician);
  const { mutateAsync: createTechnician, isPending: isCreating } =
    useCreateTechnicianMutation();
  const { mutateAsync: updateTechnician, isPending: isUpdating } =
    useUpdateTechnicianMutation();

  const formik = useFormik({
    initialValues: {
      firstName: technician?.firstName ?? "",
      lastName: technician?.lastName ?? "",
      phone: technician?.phone ?? "",
      email: technician?.email ?? "",
      specialty: technician?.specialty ?? "",
      isActive: technician?.isActive ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        specialty: values.specialty || undefined,
        isActive: values.isActive,
      };
      if (isEdit && technician) {
        await updateTechnician({ id: technician.id, payload });
      } else {
        await createTechnician(payload);
      }
      onClose();
    },
  });

  // Reset stale values when the modal is reopened for a different technician.
  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending = isCreating || isUpdating;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
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
                {isEdit ? "Edit Technician" : "Add Technician"}
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
                      placeholder="e.g. Musa"
                      error={
                        formik.touched.firstName && formik.errors.firstName
                          ? formik.errors.firstName
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Last Name"
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Ibrahim"
                    />
                  </Grid>

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Phone"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 0803 123 4567"
                    />
                    <CustomInput
                      label="Email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. musa@workshop.com"
                      error={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                    />
                  </Grid>

                  <CustomInput
                    label="Specialty"
                    name="specialty"
                    value={formik.values.specialty}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. Engine, Electrical, Bodywork"
                  />

                  <CustomSwitch
                    label="Active"
                    checked={formik.values.isActive}
                    onCheckedChange={({ checked }: { checked: boolean }) =>
                      formik.setFieldValue("isActive", checked)
                    }
                  />
                </Stack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isPending}
                    loadingText="Saving..."
                  >
                    {isEdit ? "Save Changes" : "Add Technician"}
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
