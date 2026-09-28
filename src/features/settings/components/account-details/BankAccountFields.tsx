import { useEffect, useMemo } from "react";
import { Box, Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import { CustomInput } from "@/components/input";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { CheckCircle } from "@/assets/custom/CheckCircle";
import { useBanksQuery, useResolveBankAccountQuery } from "../../api";

export interface BankAccountFieldValues {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
}

interface BankAccountFieldsProps {
  values: BankAccountFieldValues;
  /** Called with only the fields that changed. */
  onChange: (patch: Partial<BankAccountFieldValues>) => void;
  errors?: Partial<Record<keyof BankAccountFieldValues, string>>;
  disabled?: boolean;
}

/**
 * Bank, account number and account name — shared by signup and settings.
 *
 * Once a bank is picked and the number is long enough, the backend resolves
 * the name on the account and fills it in, so nobody mistypes their own
 * business name onto an invoice. The name stays editable: if the lookup
 * fails (bad number, Paystack down), they can still type it and save.
 */
export function BankAccountFields({
  values,
  onChange,
  errors,
  disabled,
}: BankAccountFieldsProps) {
  const { data: banks = [], isLoading: banksLoading } = useBanksQuery();
  const {
    data: resolved,
    isFetching: isResolving,
    isError: resolveFailed,
  } = useResolveBankAccountQuery(values.accountNumber, values.bankCode);

  const resolvedName = resolved?.accountName;

  // Fill the name in once the lookup lands.
  useEffect(() => {
    if (resolvedName && resolvedName !== values.accountName) {
      onChange({ accountName: resolvedName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedName]);

  const bankOptions = useMemo(
    () => banks.map((bank) => ({ label: bank.name, value: bank.code })),
    [banks],
  );

  return (
    <Stack gap="4">
      <SearchCombobox
        label="Bank"
        required
        options={bankOptions}
        value={values.bankCode || undefined}
        isLoading={banksLoading}
        disabled={disabled}
        placeholder={banksLoading ? "Loading banks..." : "Search bank..."}
        emptyText="No matching bank found."
        error={errors?.bankName}
        onChange={(code, option) =>
          // A new bank invalidates the name we looked up for the old one.
          onChange({
            bankCode: code,
            bankName: option?.label ?? "",
            accountName: "",
          })
        }
      />

      <CustomInput
        label="Account Number"
        required
        name="accountNumber"
        value={values.accountNumber}
        disabled={disabled}
        placeholder="0123456789"
        inputProps={{ inputMode: "numeric", maxLength: 10 }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({
            accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
            accountName: "",
          })
        }
        error={errors?.accountNumber}
      />

      <Box>
        <CustomInput
          label="Account Name"
          required
          name="accountName"
          value={values.accountName}
          disabled={disabled || isResolving}
          placeholder={
            isResolving ? "Checking account..." : "e.g. Rabbar Africa Ltd"
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ accountName: e.target.value })
          }
          error={errors?.accountName}
        />

        {isResolving && (
          <Flex align="center" gap="2" mt="1.5">
            <Spinner size="xs" color="primary.300" />
            <Text fontSize="12px" color="gray.300">
              Checking account with the bank...
            </Text>
          </Flex>
        )}

        {!isResolving && resolvedName && (
          <Flex align="center" gap="1.5" mt="1.5" color="success.300">
            <CheckCircle boxSize="0.875rem" aria-hidden="true" />
            <Text fontSize="12px" fontWeight="500">
              Name confirmed by the bank
            </Text>
          </Flex>
        )}

        {!isResolving && resolveFailed && (
          <Text fontSize="12px" color="warning.600" mt="1.5">
            We couldn&apos;t confirm this account. Check the number and bank, or
            type the name yourself.
          </Text>
        )}
      </Box>
    </Stack>
  );
}
