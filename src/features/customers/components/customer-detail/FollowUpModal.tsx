import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { useUpdateFollowUpMutation } from "../../api/query";
import type { ICustomer } from "@/shared/interface/customer";
import {
  addDaysToToday,
  daysUntil,
  toDateInputValue,
} from "../../utils/followUp";

interface FollowUpModalProps {
  open: boolean;
  onClose: () => void;
  customer: ICustomer;
}

const validationSchema = Yup.object({
  date: Yup.string().required("Next follow-up date is required"),
  days: Yup.number()
    .typeError("Enter a number of days")
    .min(1, "Must be at least 1 day")
    .max(3650, "Must be 3650 days or fewer")
    .nullable(),
  note: Yup.string().max(500, "Keep the note under 500 characters"),
});

export function FollowUpModal({ open, onClose, customer }: FollowUpModalProps) {
  const { mutateAsync, isPending } = useUpdateFollowUpMutation(customer.id);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      date: toDateInputValue(customer.followUpDate),
      days: customer.followUpInDays ? String(customer.followUpInDays) : "",
      note: customer.followUpNote ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await mutateAsync({
        date: values.date || undefined,
        days: values.days ? Number(values.days) : undefined,
        note: values.note.trim() || undefined,
      });
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Keep the two fields in sync: editing the interval moves the date and vice
  // versa, so care staff can think in whichever unit is handier.
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    formik.setFieldValue("days", raw);
    const n = Number(raw);
    if (raw && !Number.isNaN(n) && n > 0) {
      formik.setFieldValue("date", addDaysToToday(n));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    formik.setFieldValue("date", value);
    if (value) {
      const diff = daysUntil(value);
      if (!Number.isNaN(diff) && diff > 0) {
        formik.setFieldValue("days", String(diff));
      }
    }
  };

  const isEditing = Boolean(customer.followUpDate);

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
          <Dialog.Content maxW="460px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                {isEditing ? "Update follow-up" : "Set follow-up"}
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  <Text textStyle="small-regular" color="gray.300">
                    Schedule when customer care should reach out to{" "}
                    <Text as="span" fontWeight="600" color="gray.500">
                      {customer.displayName}
                    </Text>{" "}
                    next.
                  </Text>

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Next follow-up date"
                      required
                      type="date"
                      name="date"
                      value={formik.values.date}
                      onChange={handleDateChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.date && formik.errors.date
                          ? formik.errors.date
                          : undefined
                      }
                    />

                    <CustomInput
                      label="Interval (days)"
                      name="days"
                      value={formik.values.days}
                      onChange={handleDaysChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 30"
                      inputProps={{ inputMode: "numeric" }}
                      error={
                        formik.touched.days && formik.errors.days
                          ? (formik.errors.days as string)
                          : undefined
                      }
                    />
                  </Grid>

                  <CustomTextArea
                    label="Note"
                    name="note"
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                    placeholder="Optional reason or context for the follow-up"
                    error={
                      formik.touched.note && formik.errors.note
                        ? formik.errors.note
                        : undefined
                    }
                  />
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
                    {isEditing ? "Update" : "Set follow-up"}
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
