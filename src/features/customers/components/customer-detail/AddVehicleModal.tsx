import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Dialog, Flex, Grid, Portal, Stack } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SelectOrTypeField } from "@/components/input/SelectOrTypeField";
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
} from "../../api/query";
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
  /** Existing vehicle to edit; omit to add a new one. */
  vehicle?: Vehicle | null;
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
  vehicle,
  onVehicleSaved,
}: AddVehicleModalProps) {
  const isEdit = Boolean(vehicle);
  const { mutateAsync: createVehicle, isPending: isCreating } =
    useCreateVehicleMutation(clientId);
  const { mutateAsync: updateVehicle, isPending: isUpdating } =
    useUpdateVehicleMutation(vehicle?.id ?? "", clientId);
  const isPending = isCreating || isUpdating;
  const { data: makeOptions = [], isLoading: makesLoading } =
    useVehicleMakesQuery();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ? String(vehicle.year) : "",
      registrationNumber: vehicle?.registrationNumber ?? "",
      vin: vehicle?.vin ?? "",
      color: vehicle?.color ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isEdit) {
        await updateVehicle({
          make: values.make,
          model: values.model,
          year: Number(values.year),
          registrationNumber: values.registrationNumber,
          vin: values.vin || undefined,
          color: values.color || undefined,
        });
        onClose();
        return;
      }
      const created = await createVehicle({
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

  const handleMakeChange = (make: string) => {
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
                {isEdit ? "Edit Vehicle" : "Add Vehicle"}
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  {/* Make — pick from list or type manually */}
                  <SelectOrTypeField
                    label="Make"
                    required
                    name="make"
                    placeholder="Select make..."
                    typePlaceholder="e.g. Toyota"
                    options={makeOptions}
                    loading={makesLoading}
                    value={formik.values.make}
                    onChange={handleMakeChange}
                    onBlur={() => formik.setFieldTouched("make", true)}
                    error={
                      formik.touched.make && formik.errors.make
                        ? formik.errors.make
                        : undefined
                    }
                  />

                  {/* Model — pick from list or type manually (needs a make) */}
                  <SelectOrTypeField
                    label="Model"
                    required
                    name="model"
                    placeholder={
                      formik.values.make
                        ? "Select model..."
                        : "Select a make first"
                    }
                    typePlaceholder="e.g. Corolla"
                    options={modelOptions}
                    loading={modelsLoading}
                    disabled={!formik.values.make}
                    value={formik.values.model}
                    onChange={(model) => formik.setFieldValue("model", model)}
                    onBlur={() => formik.setFieldTouched("model", true)}
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
                    {isEdit ? "Save Changes" : "Add Vehicle"}
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
