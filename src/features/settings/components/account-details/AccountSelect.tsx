import { useMemo } from "react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useGetOrganizationBankAccounts } from "@/features/settings/api";
import type { IAccountRef, IOrgBankAccount } from "@/shared/interface/settings";

/** Select value for "let the server pick" — never sent to the API. */
const DEFAULT_ACCOUNT = "__default__";

type AccountLike = Pick<
  IAccountRef,
  "accountName" | "accountNumber" | "bankName"
> & { type?: IAccountRef["type"] };

/** "Main — GTBank ••1234", or just the name for the Cash account. */
export function formatAccountLabel(account: AccountLike): string {
  if (account.type === "CASH") return account.accountName;
  const last4 = account.accountNumber?.slice(-4);
  return [
    account.accountName,
    [account.bankName, last4 ? `••${last4}` : ""].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(" — ");
}

/** The org's accounts as select options, primary marked. */
export function useAccountOptions({ includeCash = false } = {}) {
  const { data, isLoading } = useGetOrganizationBankAccounts({ includeCash });
  const accounts = useMemo(() => data?.data ?? [], [data?.data]);
  const options = useMemo(
    () =>
      accounts.map((account) => ({
        label: `${formatAccountLabel(account)}${account.isPrimary ? " (Primary)" : ""}`,
        value: account.id,
      })),
    [accounts],
  );
  return { accounts, options, isLoading };
}

interface AccountSelectProps {
  label: string;
  /** Chosen account id; "" leaves it to the server's default. */
  value: string;
  onChange: (id: string) => void;
  /** Payments and expenses can go through the till; invoices cannot. */
  includeCash?: boolean;
  /** The money moved as cash, so by default it is in (or left) the till. */
  isCash?: boolean;
  /** Tried before the primary for non-cash money, e.g. the invoice's account. */
  fallbackAccountId?: string | null;
  helperText?: string;
  error?: string;
}

/**
 * Picks the org account money went through. The first option is "Default",
 * which sends nothing and lets the server choose; its label previews that
 * choice using the same order as the backend's `resolveBankAccountId`: Cash
 * for cash, then `fallbackAccountId`, then the primary.
 */
export function AccountSelect({
  label,
  value,
  onChange,
  includeCash = false,
  isCash = false,
  fallbackAccountId,
  helperText,
  error,
}: AccountSelectProps) {
  const { accounts, options, isLoading } = useAccountOptions({ includeCash });

  const defaultAccount = useMemo(() => {
    const find = (match: (a: IOrgBankAccount) => boolean) =>
      accounts.find(match);
    return (
      (includeCash && isCash ? find((a) => a.type === "CASH") : undefined) ??
      (fallbackAccountId
        ? find((a) => a.id === fallbackAccountId)
        : undefined) ??
      find((a) => a.isPrimary && a.type !== "CASH")
    );
  }, [accounts, includeCash, isCash, fallbackAccountId]);

  // The default account is offered once, as "Default", not again in the list.
  const allOptions = useMemo(
    () => [
      {
        label: `Default — ${
          defaultAccount
            ? formatAccountLabel(defaultAccount)
            : "primary account"
        }`,
        value: DEFAULT_ACCOUNT,
      },
      ...options.filter((option) => option.value !== defaultAccount?.id),
    ],
    [defaultAccount, options],
  );

  // A record already on the default account (e.g. when editing) shows as
  // "Default"; its id stays in the form, so an untouched save sends nothing.
  const selected =
    !value || value === defaultAccount?.id ? DEFAULT_ACCOUNT : value;

  return (
    <CustomSelect
      label={label}
      options={allOptions}
      loading={isLoading}
      value={[selected]}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0] ?? DEFAULT_ACCOUNT;
        onChange(next === DEFAULT_ACCOUNT ? "" : next);
      }}
      helperText={helperText}
      error={error}
    />
  );
}

const ALL_ACCOUNTS = "__all__";

/** List filter by account; "" means every account. Cash included. */
export function AccountFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { options, isLoading } = useAccountOptions({ includeCash: true });
  return (
    <CustomSelect
      options={[{ label: "All Accounts", value: ALL_ACCOUNTS }, ...options]}
      loading={isLoading}
      value={[value || ALL_ACCOUNTS]}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0] ?? ALL_ACCOUNTS;
        onChange(next === ALL_ACCOUNTS ? "" : next);
      }}
      rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
      controlProps={{ w: { base: "100%", md: "200px" } }}
    />
  );
}

/**
 * What to send for an account field on save. Create: the id, or nothing for
 * the default. Edit: nothing when unchanged (so a mode change can still
 * re-pick the default server-side), `null` to move back to the default.
 */
export function accountFieldForSave(
  value: string,
  edit?: { original: string | null | undefined },
): string | null | undefined {
  if (!edit) return value || undefined;
  if (value === (edit.original ?? "")) return undefined;
  return value || null;
}
