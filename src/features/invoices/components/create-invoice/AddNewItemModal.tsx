import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import type { Item } from "@/shared/interface/item";

interface AddNewItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Item name is required"),
  unit: Yup.string().required("Unit is required"),
  unitPrice: Yup.string().required("Rate is required"),
});

const UNIT_OPTIONS = [
  { label: "Unit", value: "unit" },
  { label: "Session", value: "session" },
  { label: "Set", value: "set" },
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
];

const TYPE_OPTIONS = [
  { label: "Product", value: "product" },
  { label: "Service", value: "service" },
];

export function AddNewItemModal({
  open,
  onClose,
  onSave,
}: AddNewItemModalProps) {
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: "service" as "service" | "product",
      unit: "unit",
      unitPrice: "",
      taxRate: "7.5",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const item: Item = {
        id: `item-custom-${Date.now()}`,
        code: `ITM-C${Date.now()}`,
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        unit: values.unit,
        unitPrice: parseFloat(values.unitPrice) || 0,
        taxRate: parseFloat(values.taxRate) || 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      onSave(item);
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
                Add New Item
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  <CustomInput
                    label="Item Name"
                    placeholder="e.g. AC Repair Service"
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
                  <CustomInput
                    label="Description"
                    placeholder="Brief description of the item"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomSelect
                      label="Type"
                      options={TYPE_OPTIONS}
                      value={[formik.values.type]}
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue(
                          "type",
                          opt?.value?.[0] ?? "service",
                        );
                      }}
                    />
                    <CustomSelect
                      label="Unit"
                      options={UNIT_OPTIONS}
                      value={[formik.values.unit]}
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue("unit", opt?.value?.[0] ?? "unit");
                      }}
                    />
                  </Grid>
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomNumberInput
                      label="Rate (₦)"
                      placeholder="0.00"
                      required
                      value={formik.values.unitPrice}
                      onValueChange={(raw) =>
                        formik.setFieldValue("unitPrice", raw)
                      }
                      error={
                        formik.touched.unitPrice && formik.errors.unitPrice
                          ? String(formik.errors.unitPrice)
                          : undefined
                      }
                    />
                    <CustomNumberInput
                      label="Tax Rate (%)"
                      placeholder="0"
                      precision={1}
                      value={formik.values.taxRate}
                      onValueChange={(raw) =>
                        formik.setFieldValue("taxRate", raw)
                      }
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
                    Save Item
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
