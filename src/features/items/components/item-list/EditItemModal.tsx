import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useUpdateItemMutation } from "../../api/query";

interface ApiItem {
  id: string;
  name: string;
  description: string | null;
  rate: string;
  purchaseRate: string;
  productType: string;
  unit: string | null;
  status: string;
}

interface EditItemModalProps {
  open: boolean;
  onClose: () => void;
  item: ApiItem;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  productType: Yup.string().required("Type is required"),
  unit: Yup.string(),
  rate: Yup.number()
    .typeError("Rate must be a number")
    .min(0, "Rate cannot be negative")
    .required("Rate is required"),
  purchaseRate: Yup.number()
    .typeError("Purchase rate must be a number")
    .min(0, "Rate cannot be negative"),
});

const PRODUCT_TYPE_OPTIONS = [
  { label: "Goods", value: "GOODS" },
  { label: "Service", value: "SERVICE" },
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

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function EditItemModal({ open, onClose, item }: EditItemModalProps) {
  const { mutateAsync, isPending } = useUpdateItemMutation(item.id);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: item.name ?? "",
      description: item.description ?? "",
      productType: item.productType ?? "",
      unit: item.unit ?? "",
      rate: item.rate ?? "",
      purchaseRate: item.purchaseRate ?? "",
      status: item.status ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await mutateAsync({
        name: values.name,
        description: values.description || undefined,
        productType: values.productType,
        unit: values.unit || undefined,
        rate: values.rate,
        purchaseRate: values.purchaseRate || undefined,
        status: values.status,
      });
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
          <Dialog.Content maxW="520px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Edit Item
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
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

                  <CustomInput
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Brief description..."
                  />

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomSelect
                      label="Type"
                      required
                      options={PRODUCT_TYPE_OPTIONS}
                      placeholder="Select type..."
                      value={
                        formik.values.productType
                          ? [formik.values.productType]
                          : undefined
                      }
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue(
                          "productType",
                          opt?.value?.[0] ?? "",
                        );
                      }}
                      error={
                        formik.touched.productType && formik.errors.productType
                          ? formik.errors.productType
                          : undefined
                      }
                    />

                    <CustomSelect
                      label="Unit"
                      options={UNIT_OPTIONS}
                      placeholder="Select unit..."
                      value={
                        formik.values.unit ? [formik.values.unit] : undefined
                      }
                      onChange={(opt: { value: string[] }) => {
                        formik.setFieldValue("unit", opt?.value?.[0] ?? "");
                      }}
                    />
                  </Grid>

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Rate (₦)"
                      required
                      name="rate"
                      value={formik.values.rate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      error={
                        formik.touched.rate && formik.errors.rate
                          ? formik.errors.rate
                          : undefined
                      }
                    />

                    <CustomInput
                      label="Purchase Rate (₦)"
                      name="purchaseRate"
                      value={formik.values.purchaseRate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      error={
                        formik.touched.purchaseRate &&
                        formik.errors.purchaseRate
                          ? formik.errors.purchaseRate
                          : undefined
                      }
                    />
                  </Grid>

                  <CustomSelect
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status..."
                    value={
                      formik.values.status ? [formik.values.status] : undefined
                    }
                    onChange={(opt: { value: string[] }) => {
                      formik.setFieldValue("status", opt?.value?.[0] ?? "");
                    }}
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
