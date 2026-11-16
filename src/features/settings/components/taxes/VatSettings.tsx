import { useEffect, useState } from "react";
import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { CustomInput, CustomSwitch } from "@/components/input";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetOrganizationDetails,
  useSaveVatSettingsMutation,
} from "../../api";

/** Letters, digits and dashes, upper case, no spaces: as the API keeps it. */
const cleanTin = (value: string) => value.replace(/\s+/g, "").toUpperCase();
const TIN_PATTERN = /^[A-Z0-9-]*$/;

const dayOf = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "";

/**
 * Settings → Taxes: whether the business is VAT-registered (and since when),
 * and its TIN. Read-only for those who can't change business settings.
 */
export function VatSettings() {
  const mayManage = usePermissions().canUpdate("organization");
  const { data } = useGetOrganizationDetails();
  const organization = data?.data;
  const config = organization?.config;

  const saved = {
    vatRegistered: Boolean(config?.vatRegistered),
    vatRegisteredFrom: dayOf(config?.vatRegisteredFrom),
    taxId: organization?.taxId ?? "",
  };
  const [form, setForm] = useState(saved);
  // Starts from what's saved, and again whenever that changes.
  useEffect(() => {
    setForm(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.vatRegistered, saved.vatRegisteredFrom, saved.taxId]);

  const { mutate, isPending } = useSaveVatSettingsMutation();

  const tin = cleanTin(form.taxId);
  const tinError = TIN_PATTERN.test(tin)
    ? undefined
    : "Only letters, digits and dashes";
  const configChanged =
    form.vatRegistered !== saved.vatRegistered ||
    (form.vatRegistered && form.vatRegisteredFrom !== saved.vatRegisteredFrom);
  const tinChanged = tin !== cleanTin(saved.taxId);
  const dirty = configChanged || tinChanged;

  const save = () => {
    if (tinError) return;
    mutate({
      ...(configChanged
        ? {
            config: {
              vatRegistered: form.vatRegistered,
              vatRegisteredFrom: form.vatRegistered
                ? form.vatRegisteredFrom || null
                : null,
            },
          }
        : {}),
      ...(tinChanged ? { taxId: tin } : {}),
    });
  };

  if (!organization) return null;

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      p="4"
      mb="5"
      data-testid="vat-settings"
    >
      <Text fontSize="14px" fontWeight="600" color="gray.500">
        VAT registration
      </Text>

      {mayManage ? (
        <Stack gap="4" mt="3">
          <Box>
            <CustomSwitch
              reversed
              checked={form.vatRegistered}
              onCheckedChange={(e: { checked: boolean }) =>
                setForm((f) => ({ ...f, vatRegistered: e.checked }))
              }
            >
              VAT registered
            </CustomSwitch>
            <Text fontSize="12px" color="gray.400" mt="1">
              Turn this on if your business is registered for VAT with the tax
              office. You can then record the VAT you pay on expenses, and see
              what you owe each month in Reports → Taxes.
            </Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            {form.vatRegistered && (
              <CustomInput
                type="date"
                label="Registered from"
                max={moment().format("YYYY-MM-DD")}
                value={form.vatRegisteredFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, vatRegisteredFrom: e.target.value }))
                }
              />
            )}
            <CustomInput
              label="TIN (Tax ID)"
              placeholder="e.g. 12345678-0001"
              helperText="Printed on your invoices, credit notes and quotes."
              value={form.taxId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, taxId: e.target.value }))
              }
              error={tinError}
            />
          </Grid>

          {dirty && (
            <Flex gap="2" justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setForm(saved)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                loading={isPending}
                disabled={Boolean(tinError)}
              >
                Save
              </Button>
            </Flex>
          )}
        </Stack>
      ) : (
        <Stack gap="1" mt="2" fontSize="13px" color="gray.400">
          <Text>
            {saved.vatRegistered
              ? saved.vatRegisteredFrom
                ? `VAT registered since ${moment(saved.vatRegisteredFrom).format("DD MMM YYYY")}`
                : "VAT registered"
              : "Not VAT registered"}
          </Text>
          <Text>TIN: {saved.taxId || "Not set"}</Text>
        </Stack>
      )}
    </Box>
  );
}
