import { PlanFeatureNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { useEffect } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CustomInput,
  CustomNumberInput,
  CustomSelect,
  CustomSwitch,
} from "@/components/input";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import {
  ORG_TAX_TYPE_LABELS,
  type CreateOrgTaxPayload,
  type IOrgTax,
  type OrgTaxType,
} from "@/shared/interface/settings";

const TYPE_OPTIONS = (Object.keys(ORG_TAX_TYPE_LABELS) as OrgTaxType[]).map(
  (value) => ({ value, label: ORG_TAX_TYPE_LABELS[value] }),
);
import { useCreateOrganizationTax, useUpdateOrganizationTax } from "../../api";

interface TaxModalProps {
  open: boolean;
  onClose: () => void;
  tax?: IOrgTax | null;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Tax name is required"),
  rate: Yup.number()
    .typeError("Rate must be a number")
    .min(0, "Cannot be negative")
    .required("Rate is required"),
});

export function TaxModal({ open, onClose, tax }: TaxModalProps) {
  const isEdit = !!tax;
  const { hasFeature } = usePlanAccess();
  const { mutate: createTax, isPending: isCreating } =
    useCreateOrganizationTax();
  const { mutate: updateTax, isPending: isUpdating } =
    useUpdateOrganizationTax();

  const formik = useFormik<CreateOrgTaxPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      name: tax?.name ?? "",
      rate: tax?.rate ?? 0,
      isCompound: tax?.isCompound ?? false,
      isDefault: tax?.isDefault ?? false,
      // A new tax is most often VAT; an existing one keeps what it is.
      type: tax ? (tax.type ?? "OTHER") : "VAT",
    },
    onSubmit: (values) => {
      if (isEdit && tax) {
        updateTax({ id: tax.id, payload: values }, { onSuccess: onClose });
      } else {
        createTax(values, { onSuccess: onClose });
      }
    },
  });

  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          <Dialog.Content w="28rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body
              overflow="auto"
              maxH="min(44.375rem, calc(100dvh - 4rem))"
              css={chakraScrollbarStyle}
            >
              <form onSubmit={formik.handleSubmit}>
                <Stack gap="5">
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    {isEdit ? "Edit Tax" : "Add Tax"}
                  </Text>
                  <CustomInput
                    label="Name"
                    placeholder="e.g. VAT"
                    required
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.name
                        ? (formik.errors.name as string)
                        : undefined
                    }
                  />
                  <CustomNumberInput
                    label="Rate (%)"
                    required
                    precision={2}
                    allowNegative={false}
                    min={0}
                    name="rate"
                    value={formik.values.rate}
                    onValueChange={(_str, num) =>
                      formik.setFieldValue("rate", num ?? "")
                    }
                    error={
                      formik.touched.rate
                        ? (formik.errors.rate as string)
                        : undefined
                    }
                  />
                  <CustomSelect
                    label="Type"
                    options={TYPE_OPTIONS}
                    value={[formik.values.type ?? "OTHER"]}
                    onChange={(opt: { value: string[] }) =>
                      formik.setFieldValue("type", opt?.value?.[0] ?? "OTHER")
                    }
                    helperText="Only VAT is counted in the VAT summary and VAT return."
                  />
                  <CustomSwitch
                    reversed
                    checked={formik.values.isCompound}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue("isCompound", e.checked)
                    }
                  >
                    Compound tax (applied on top of other taxes)
                  </CustomSwitch>
                  <CustomSwitch
                    reversed
                    // Locked only for turning it on: a default saved before a
                    // downgrade can still be turned off.
                    disabled={
                      !hasFeature("defaultVat") && !formik.values.isDefault
                    }
                    checked={formik.values.isDefault}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue("isDefault", e.checked)
                    }
                  >
                    Set as default tax
                  </CustomSwitch>
                  <PlanFeatureNotice feature="defaultVat" />
                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isCreating || isUpdating}>
                      {isEdit ? "Save Changes" : "Add Tax"}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
