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
import { CustomInput, CustomSelect, CustomSwitch } from "@/components/input";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import {
  ORG_ADDRESS_TYPES,
  type CreateOrgAddressPayload,
  type IOrgAddress,
} from "@/shared/interface/settings";
import {
  useCreateOrganizationAddress,
  useUpdateOrganizationAddress,
} from "../../api";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  address?: IOrgAddress | null;
}

const typeOptions = ORG_ADDRESS_TYPES.map((t) => ({
  label: t.charAt(0) + t.slice(1).toLowerCase(),
  value: t,
}));

const validationSchema = Yup.object({
  type: Yup.string().required("Type is required"),
  addressLine1: Yup.string().required("Address line 1 is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
});

export function AddressModal({ open, onClose, address }: AddressModalProps) {
  const isEdit = !!address;
  const { mutate: createAddress, isPending: isCreating } =
    useCreateOrganizationAddress();
  const { mutate: updateAddress, isPending: isUpdating } =
    useUpdateOrganizationAddress();

  const formik = useFormik<CreateOrgAddressPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      label: address?.label ?? "",
      type: address?.type ?? "OFFICE",
      attention: address?.attention ?? "",
      addressLine1: address?.addressLine1 ?? "",
      addressLine2: address?.addressLine2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      country: address?.country ?? "",
      postalCode: address?.postalCode ?? "",
      phone: address?.phone ?? "",
      isPrimary: address?.isPrimary ?? false,
    },
    onSubmit: (values) => {
      if (isEdit && address) {
        updateAddress(
          { id: address.id, payload: values },
          { onSuccess: onClose },
        );
      } else {
        createAddress(values, { onSuccess: onClose });
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
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="35rem" maxW="full" borderRadius="2xl" pt="2.5rem">
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
                    {isEdit ? "Edit Address" : "Add Address"}
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="Label"
                      placeholder="e.g. Head Office"
                      name="label"
                      value={formik.values.label ?? ""}
                      onChange={formik.handleChange}
                    />
                    <CustomSelect
                      label="Type"
                      options={typeOptions}
                      value={[formik.values.type]}
                      onChange={(opt: any) =>
                        formik.setFieldValue("type", opt?.value?.[0])
                      }
                      error={
                        formik.touched.type
                          ? (formik.errors.type as string)
                          : undefined
                      }
                    />
                  </Grid>
                  <CustomInput
                    label="Attention"
                    placeholder="Contact person"
                    name="attention"
                    value={formik.values.attention ?? ""}
                    onChange={formik.handleChange}
                  />
                  <CustomInput
                    label="Street"
                    required
                    name="addressLine1"
                    inputProps={{ id: "street" }}
                    value={formik.values.addressLine1 ?? ""}
                    placeholder="12 Bode Thomas Street"
                    onChange={formik.handleChange}
                    error={
                      formik.touched.addressLine1
                        ? (formik.errors.addressLine1 as string)
                        : undefined
                    }
                  />
                  {/* <CustomInput
                    label="Address Line 2"
                    name="addressLine2"
                    value={formik.values.addressLine2 ?? ""}
                    onChange={formik.handleChange}
                  /> */}
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="City"
                      required
                      name="city"
                      value={formik.values.city ?? ""}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.city
                          ? (formik.errors.city as string)
                          : undefined
                      }
                      placeholder="Surulere"
                    />
                    <CustomInput
                      label="State / Region"
                      name="state"
                      value={formik.values.state ?? ""}
                      onChange={formik.handleChange}
                      placeholder="Lagos"
                    />
                    <CustomInput
                      label="Country"
                      required
                      name="country"
                      value={formik.values.country ?? ""}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.country
                          ? (formik.errors.country as string)
                          : undefined
                      }
                      placeholder="Nigeria"
                    />
                    <CustomInput
                      label="Postal Code"
                      name="postalCode"
                      value={formik.values.postalCode ?? ""}
                      onChange={formik.handleChange}
                      placeholder="101283 "
                    />
                  </Grid>
                  <CustomInput
                    label="Phone"
                    name="phone"
                    value={formik.values.phone ?? ""}
                    onChange={formik.handleChange}
                  />
                  <CustomSwitch
                    reversed
                    checked={formik.values.isPrimary}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue("isPrimary", e.checked)
                    }
                  >
                    Set as primary address
                  </CustomSwitch>
                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isCreating || isUpdating}>
                      {isEdit ? "Save Changes" : "Add Address"}
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
