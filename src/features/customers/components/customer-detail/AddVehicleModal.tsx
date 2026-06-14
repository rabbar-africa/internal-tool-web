import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useCreateVehicleMutation } from "../../api/query";
import type { Vehicle } from "../../api/service";
import {
  useVehicleMakesQuery,
  useVehicleModelsQuery,
  getYearOptions,
} from "@/lib/nhtsa";

interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  /** Called with the newly created vehicle after a successful save */
  onVehicleSaved?: (vehicle: Vehicle) => void;
}

const validationSchema = Yup.object({
  make: Yup.string().required("Make is required"),
  model: Yup.string().required("Model is required"),
  year: Yup.string().required("Year is required"),
  registrationNumber: Yup.string().required("Registration number is required"),
  vin: Yup.string(),
  color: Yup.string(),
});

const YEAR_OPTIONS = getYearOptions();

export function AddVehicleModal({
  open,
  onClose,
  clientId,
  onVehicleSaved,
}: AddVehicleModalProps) {
  const { mutateAsync, isPending } = useCreateVehicleMutation(clientId);
  const { data: makeOptions = [], isLoading: makesLoading } =
    useVehicleMakesQuery();

  const formik = useFormik({
    initialValues: {
      make: "",
      model: "",
      year: "",
      registrationNumber: "",
      vin: "",
      color: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const created = await mutateAsync({
        make: values.make,
        model: values.model,
        year: Number(values.year),
        registrationNumber: values.registrationNumber,
        vin: values.vin || undefined,
        color: values.color || undefined,
        clientId,
      });
      onVehicleSaved?.(created);
      onClose();
    },
  });

  const { data: modelOptions = [], isLoading: modelsLoading } =
    useVehicleModelsQuery(formik.values.make);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleMakeChange = (opt: { value: string[] }) => {
    const make = opt?.value?.[0] ?? "";
    formik.setFieldValue("make", make);
    formik.setFieldValue("model", ""); // reset model when make changes
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
                Add Vehicle
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  {/* Make */}
                  <CustomSelect
                    label="Make"
                    required
                    placeholder="Select make..."
                    options={makeOptions}
                    loading={makesLoading}
                    value={
                      formik.values.make ? [formik.values.make] : undefined
                    }
                    onChange={handleMakeChange}
                    error={
                      formik.touched.make && formik.errors.make
                        ? formik.errors.make
                        : undefined
                    }
                  />

                  {/* Model — disabled until make selected */}
                  <CustomSelect
                    label="Model"
                    required
                    placeholder={
                      formik.values.make
                        ? "Select model..."
                        : "Select a make first"
                    }
                    options={modelOptions}
                    loading={modelsLoading}
                    disabled={!formik.values.make}
                    value={
                      formik.values.model ? [formik.values.model] : undefined
                    }
                    onChange={(opt: { value: string[] }) =>
                      formik.setFieldValue("model", opt?.value?.[0] ?? "")
                    }
                    error={
                      formik.touched.model && formik.errors.model
                        ? formik.errors.model
                        : undefined
                    }
                  />

                  <Grid templateColumns="1fr 1fr" gap="4">
                    {/* Year */}
                    <CustomSelect
                      label="Year"
                      required
                      placeholder="Select year..."
                      options={YEAR_OPTIONS}
                      value={
                        formik.values.year ? [formik.values.year] : undefined
                      }
                      onChange={(opt: { value: string[] }) =>
                        formik.setFieldValue("year", opt?.value?.[0] ?? "")
                      }
                      error={
                        formik.touched.year && formik.errors.year
                          ? formik.errors.year
                          : undefined
                      }
                    />

                    {/* Color */}
                    <CustomInput
                      label="Color"
                      name="color"
                      value={formik.values.color}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Silver"
                    />
                  </Grid>

                  {/* Registration Number */}
                  <CustomInput
                    label="Registration Number"
                    required
                    name="registrationNumber"
                    value={formik.values.registrationNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. ABC 123 XY"
                    error={
                      formik.touched.registrationNumber &&
                      formik.errors.registrationNumber
                        ? formik.errors.registrationNumber
                        : undefined
                    }
                  />

                  {/* VIN */}
                  <CustomInput
                    label="VIN"
                    name="vin"
                    value={formik.values.vin}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Vehicle Identification Number (optional)"
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
                    Add Vehicle
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
