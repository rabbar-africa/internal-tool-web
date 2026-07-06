import { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import {
  useGetAllCustomersQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import {
  REMINDER_TYPE_OPTIONS,
  type CreateReminderPayload,
  type Reminder,
  type ReminderType,
} from "@/shared/interface/reminder";

export interface ReminderFormDefaults {
  type?: ReminderType;
  title?: string;
  clientId?: string;
  vehicleId?: string;
  dueDate?: string;
}

interface ReminderFormProps {
  /** Existing reminder when editing; omit to create. */
  reminder?: Reminder;
  /** Prefill values (e.g. clientId when created from a client page). */
  defaults?: ReminderFormDefaults;
  /** Lock the type field (e.g. a dedicated service form). */
  lockType?: boolean;
  /** Override the submit button label (defaults to Create/Save). */
  submitLabel?: string;
  isSubmitting: boolean;
  onSubmit: (payload: CreateReminderPayload) => Promise<void>;
  onCancel: () => void;
}

const numberField = (message: string) =>
  Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError(message)
    .min(0, "Cannot be negative");

const validationSchema = Yup.object({
  type: Yup.string().required("Type is required"),
  title: Yup.string().required("Title is required"),
  dueDate: Yup.string().required("Due date is required"),
  dueMileage: numberField("Mileage must be a number"),
  intervalMonths: numberField("Months must be a number"),
  intervalDays: numberField("Days must be a number"),
  intervalMileage: numberField("Mileage must be a number"),
});

function SectionHeader({
  num,
  title,
  subtitle,
}: {
  num: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <HStack gap="2">
      <Flex
        w="8"
        h="8"
        bg="primary.50"
        rounded="lg"
        align="center"
        justify="center"
      >
        <Text color="primary.300" fontSize="sm" fontWeight="600">
          {num}
        </Text>
      </Flex>
      <Box>
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="xs" color="gray.200">
            {subtitle}
          </Text>
        )}
      </Box>
    </HStack>
  );
}

export function ReminderForm({
  reminder,
  defaults,
  lockType,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReminderFormProps) {
  const isEdit = Boolean(reminder);

  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({ limit: 100 });

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      type: (reminder?.type ?? defaults?.type ?? "SERVICE") as string,
      title: reminder?.title ?? defaults?.title ?? "",
      dueDate: reminder?.dueDate ?? defaults?.dueDate ?? "",
      clientId: reminder?.clientId ?? defaults?.clientId ?? "",
      vehicleId: reminder?.vehicleId ?? defaults?.vehicleId ?? "",
      dueMileage:
        reminder?.dueMileage != null ? String(reminder.dueMileage) : "",
      notes: reminder?.notes ?? "",
      intervalMonths:
        reminder?.intervalMonths != null ? String(reminder.intervalMonths) : "",
      intervalDays:
        reminder?.intervalDays != null ? String(reminder.intervalDays) : "",
      intervalMileage:
        reminder?.intervalMileage != null
          ? String(reminder.intervalMileage)
          : "",
    },
    onSubmit: async (values) => {
      const num = (v: string) => (v === "" ? undefined : Number(v));
      const payload: CreateReminderPayload = {
        type: values.type.trim().toUpperCase(),
        title: values.title.trim(),
        dueDate: values.dueDate,
        notes: values.notes.trim() || undefined,
        dueMileage: num(values.dueMileage),
        // On edit, an empty link means "unlink" → null; on create, omit.
        clientId: values.clientId || (isEdit ? null : undefined),
        vehicleId: values.vehicleId || (isEdit ? null : undefined),
        intervalMonths: num(values.intervalMonths),
        intervalDays: num(values.intervalDays),
        intervalMileage: num(values.intervalMileage),
      };
      await onSubmit(payload);
    },
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(formik.values.clientId);

  const customerOptions = useMemo(
    () =>
      (customersData?.data ?? []).map((customer) => ({
        label: customer.displayName,
        value: customer.id,
      })),
    [customersData?.data],
  );

  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];
  const vehicleOptions = vehicles.map((vehicle) => ({
    label: `${vehicle.make} ${vehicle.model} (${vehicle.year}) • ${vehicle.registrationNumber}`,
    value: vehicle.id,
  }));

  const handleClientChange = (opt: { value: string[] } | null) => {
    const clientId = opt?.value?.[0] ?? "";
    formik.setFieldValue("clientId", clientId);
    formik.setFieldValue("vehicleId", "");
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="5">
        {/* Section 1: What & when */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={1}
              title="Reminder"
              subtitle="What needs doing and when it's due"
            />
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                <CustomSelect
                  label="Type"
                  required
                  disabled={lockType}
                  options={REMINDER_TYPE_OPTIONS}
                  value={formik.values.type ? [formik.values.type] : undefined}
                  onChange={(opt: { value: string[] }) =>
                    formik.setFieldValue("type", opt?.value?.[0] ?? "SERVICE")
                  }
                  error={
                    formik.touched.type && formik.errors.type
                      ? formik.errors.type
                      : undefined
                  }
                />
                <CustomInput
                  label="Due Date"
                  type="date"
                  required
                  name="dueDate"
                  value={formik.values.dueDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.dueDate && formik.errors.dueDate
                      ? formik.errors.dueDate
                      : undefined
                  }
                />
              </Grid>
              <CustomInput
                label="Title"
                required
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Oil change, Insurance renewal"
                error={
                  formik.touched.title && formik.errors.title
                    ? formik.errors.title
                    : undefined
                }
              />
              <CustomTextArea
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Any extra context"
                rows={2}
              />
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Section 2: Who / which vehicle */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={2}
              title="Linked to"
              subtitle="Attach the reminder to a customer and vehicle (optional)"
            />
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
              <CustomSelect
                label="Customer"
                placeholder="Select customer..."
                options={customerOptions}
                loading={customersLoading}
                value={
                  formik.values.clientId ? [formik.values.clientId] : undefined
                }
                onChange={handleClientChange}
              />
              {formik.values.clientId && (
                <CustomSelect
                  label="Vehicle"
                  placeholder={
                    vehicleOptions.length > 0
                      ? "Select vehicle..."
                      : "No saved vehicles for this customer"
                  }
                  options={vehicleOptions}
                  loading={vehiclesLoading}
                  value={
                    formik.values.vehicleId
                      ? [formik.values.vehicleId]
                      : undefined
                  }
                  onChange={(opt: { value: string[] } | null) =>
                    formik.setFieldValue("vehicleId", opt?.value?.[0] ?? "")
                  }
                />
              )}
              <CustomInput
                label="Due Mileage (km)"
                name="dueMileage"
                value={formik.values.dueMileage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 90000"
                error={
                  formik.touched.dueMileage && formik.errors.dueMileage
                    ? formik.errors.dueMileage
                    : undefined
                }
              />
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Section 3: Recurrence */}
        <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
          <Card.Header pb="0">
            <SectionHeader
              num={3}
              title="Recurrence"
              subtitle="Optional — completing the reminder spawns the next one"
            />
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
              <CustomInput
                label="Every (months)"
                name="intervalMonths"
                value={formik.values.intervalMonths}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 6"
                error={
                  formik.touched.intervalMonths && formik.errors.intervalMonths
                    ? formik.errors.intervalMonths
                    : undefined
                }
              />
              <CustomInput
                label="Every (days)"
                name="intervalDays"
                value={formik.values.intervalDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 90"
                error={
                  formik.touched.intervalDays && formik.errors.intervalDays
                    ? formik.errors.intervalDays
                    : undefined
                }
              />
              <CustomInput
                label="Every (mileage km)"
                name="intervalMileage"
                value={formik.values.intervalMileage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 5000"
                error={
                  formik.touched.intervalMileage &&
                  formik.errors.intervalMileage
                    ? formik.errors.intervalMileage
                    : undefined
                }
              />
            </Grid>
          </Card.Body>
        </Card.Root>

        <Flex justify="flex-end" gap="3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="Saving...">
            {submitLabel ?? (isEdit ? "Save Changes" : "Create Reminder")}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
