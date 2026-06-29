import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import type {
  CreateItemPayload,
  Item,
  ItemType,
} from "@/shared/interface/item";
import { useCreateItemMutation } from "@/features/items/api/query";

interface AddNewItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Item name is required"),
  description: Yup.string(),
  type: Yup.string().required("Type is required"),
  unit: Yup.string().required("Unit is required"),
  unitPrice: Yup.string().required("Unit price is required"),
  taxRate: Yup.string(),
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

export function AddNewItemModal({
  open,
  onClose,
  onSave,
}: AddNewItemModalProps) {
  const { mutateAsync, isPending } = useCreateItemMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      type: "product" as ItemType | "",
      unit: "each",
      unitPrice: "",
      taxRate: "7.5",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload: CreateItemPayload = {
        name: values.name,
        description: values.description || undefined,
        productType: values.type
          ? (values.type.toUpperCase() as "PRODUCT" | "SERVICE")
          : undefined,
        unit: values.unit,
        rate: Number(values.unitPrice),
        status: "ACTIVE",
      };

      const res = await mutateAsync(payload);

      // Backend returns the newly created item. Merge it over a record built
      // from the form values so the line item always has id/name/rate/unit to
      // select on, even if the response omits a field.
      const serverItem = ((res as unknown as { data?: Item })?.data ??
        res ??
        {}) as Partial<Item>;
      const created: Item = {
        code: "",
        name: values.name,
        description: values.description || undefined,
        type: values.type as ItemType,
        unit: values.unit,
        unitPrice: Number(values.unitPrice) || 0,
        taxRate: Number(values.taxRate) || 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        ...serverItem,
        id: serverItem.id ?? "",
      };

      onSave(created);
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
                    placeholder="e.g. Engine Oil Change"
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
                    placeholder="Brief description of this item or service"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomSelect
                      label="Type"
                      required
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
                    <CustomSelect
                      label="Unit of Measure"
                      required
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
                  </Grid>
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomNumberInput
                      label="Unit Price (₦)"
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
