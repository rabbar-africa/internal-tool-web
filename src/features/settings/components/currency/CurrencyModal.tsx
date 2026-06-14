import { useEffect } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CustomInput,
  CustomNumberInput,
  CustomSwitch,
} from "@/components/input";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import type {
  CreateOrgCurrencyPayload,
  IOrgCurrency,
} from "@/shared/interface/settings";
import {
  useCreateOrganizationCurrency,
  useUpdateOrganizationCurrency,
} from "../../api";

interface CurrencyModalProps {
  open: boolean;
  onClose: () => void;
  currency?: IOrgCurrency | null;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required("Currency code is required")
    .length(3, "Use the 3-letter ISO code (e.g. NGN)"),
  exchangeRate: Yup.number()
    .typeError("Exchange rate must be a number")
    .min(0, "Cannot be negative")
    .required("Exchange rate is required"),
});

export function CurrencyModal({ open, onClose, currency }: CurrencyModalProps) {
  const isEdit = !!currency;
  const { mutate: createCurrency, isPending: isCreating } =
    useCreateOrganizationCurrency();
  const { mutate: updateCurrency, isPending: isUpdating } =
    useUpdateOrganizationCurrency();

  const formik = useFormik<CreateOrgCurrencyPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      code: currency?.code ?? "",
      symbol: currency?.symbol ?? "",
      name: currency?.name ?? "",
      exchangeRate: currency?.exchangeRate ?? 1,
      isDefault: currency?.isDefault ?? false,
    },
    onSubmit: (values) => {
      if (isEdit && currency) {
        // code is immutable on update
        const { code: _code, ...rest } = values;
        void _code;
        updateCurrency(
          { id: currency.id, payload: rest },
          { onSuccess: onClose },
        );
      } else {
        createCurrency(
          { ...values, code: values.code.toUpperCase() },
          { onSuccess: onClose },
        );
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
      closeOnInteractOutside={false}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="30rem" maxW="full" borderRadius="2xl" pt="2.5rem">
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
                    {isEdit ? "Edit Currency" : "Add Currency"}
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="Code (ISO)"
                      placeholder="NGN"
                      required
                      disabled={isEdit}
                      name="code"
                      value={formik.values.code}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.code
                          ? (formik.errors.code as string)
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Symbol"
                      placeholder="₦"
                      name="symbol"
                      value={formik.values.symbol ?? ""}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <CustomInput
                    label="Name"
                    placeholder="Nigerian Naira"
                    name="name"
                    value={formik.values.name ?? ""}
                    onChange={formik.handleChange}
                  />
                  <CustomNumberInput
                    label="Exchange Rate (to default)"
                    required
                    precision={6}
                    allowNegative={false}
                    min={0}
                    name="exchangeRate"
                    value={formik.values.exchangeRate}
                    onValueChange={(_str, num) =>
                      formik.setFieldValue("exchangeRate", num ?? "")
                    }
                    error={
                      formik.touched.exchangeRate
                        ? (formik.errors.exchangeRate as string)
                        : undefined
                    }
                  />
                  <CustomSwitch
                    reversed
                    checked={formik.values.isDefault}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue("isDefault", e.checked)
                    }
                  >
                    Set as default currency
                  </CustomSwitch>
                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isCreating || isUpdating}>
                      {isEdit ? "Save Changes" : "Add Currency"}
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
