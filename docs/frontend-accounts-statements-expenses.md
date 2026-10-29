# Frontend brief: accounts, cash, statements and invoice costs

The backend now records which account every naira went through, keeps a Cash account for money in the till, produces account statements (on screen, as a PDF, by email) and records expenses in bulk, including the costs of an invoice. This brief is the web app's side of that work, in five phases. Each phase can ship on its own once the one before it is live.

## Before you start

- **Base URL** is `/api/v1`. JSON responses are wrapped as `{ status, data, meta? }`. PDF downloads are not wrapped: they come back as the raw file.
- **Every field in this brief is optional** unless marked otherwise. Leave a field out and the backend picks a sensible default (explained in each phase), so nothing breaks while screens catch up.
- **There is a new permission, `banking`** (create / read / update / delete). It controls account transfers and statements. Super admins, the system `admin` role and `accountant` have it, and existing orgs were granted it by migration. Show it in the role editor like the other subjects. Hide transfer and statement screens from users who don't have `read banking`; the API answers them with 403.
- **Error messages are written for users.** Show `message` from 400, 404 and 409 responses as it is.

---

## Phase 1: accounts and the account picker

An org now has bank accounts plus exactly one **Cash** account (the till). Every account has a `type`.

### Account shape

```ts
type Account = {
  id: string;
  type: 'BANK' | 'CASH';
  accountName: string;          // "Cash" for the till (renamable)
  accountNumber: string | null; // null only for CASH
  bankName: string | null;      // null only for CASH
  bankCode: string | null;
  isPrimary: boolean;           // exactly one BANK account is primary; CASH never is
  openingBalance: number;       // what the account held on openingBalanceDate
  openingBalanceDate: string | null; // YYYY-MM-DD; null = "from the start"
};
```

### Endpoints

| What | Call |
|---|---|
| Bank accounts (settings page) | `GET /organizations/me/bank-accounts`: bank accounts only, unchanged |
| Every account (pickers) | `GET /organizations/me/bank-accounts?includeCash=true`: banks first (primary at the top), Cash last |
| Add / edit | as today, plus optional `openingBalance` (number, may be negative) and `openingBalanceDate` (YYYY-MM-DD, or `null` to clear) |

### Settings page

- **Opening balance:** add both fields to the add/edit form, labelled *"Balance on"* + date. Helper text: *"What this account held on this date. Statements start from here."*
- **The Cash account:** show it in its own row or card (e.g. *"Cash on hand"*), even though this page's list call doesn't return it. Fetch it with `includeCash=true`.
  - **Rename and opening balance only.** It has no account number, bank or "make primary" action, and it can't be deleted. If those controls are shown anyway, the API refuses them (400 / 409).
- **Deleting an account in use:** the API returns 409 with the reason, e.g. *"Cannot delete this bank account: 3 payments, 1 expense and 2 transfers went through it."* Show it as is.

### The account picker (shared component, fix the duplicate)

At the moment the picker shows a separate *"Default"* entry **and** the same account again in the list, so it appears twice. Fix it like this:

- **One list, no synthetic "Default" entry.** Every account appears exactly once, built from `?includeCash=true`.
- **Show the default by pre-selecting it**, with a small *Primary* badge on the primary account and *Cash* on the till. Don't add an extra row.
- **What to pre-select:**
  - payment or expense with mode `CASH`: the Cash account;
  - any other mode: for a payment against invoices that all name the same account, that account; otherwise the primary bank account;
  - invoice: the primary bank account. **The Cash account must not appear in the invoice picker** (filter `type === 'CASH'` out); the API rejects it with 400.
- **When the payment mode changes**, re-select the matching default, unless the user has already chosen an account by hand.
- **If the user never touches the picker, you may leave the field out.** The backend applies these same rules.

**Done when:** each account appears once in every picker, Cash is pre-selected for cash, and invoices can't pick Cash.

---

## Phase 2: payments, expenses and invoices name their account

| Record | Field (create & update) | Comes back as |
|---|---|---|
| Payment received | `depositToAccountId` | `depositToAccount` (Account) |
| Expense | `paidThroughAccountId` | `paidThroughAccount` (Account) |
| Invoice | `bankAccountId` (bank accounts only) | `bankAccount` (Account) |

- **Payment forms:** *Record payment*, *Edit payment*, and the collect-payment endpoints `POST /invoices/:id/collect` and `POST /job-cards/:id/collect` all accept `depositToAccountId`. Label it *"Paid into"*.
- **Always send the payment `mode`.** A payment with no mode is saved as `CASH` and lands in the Cash account.
- **Expense form:** label the field *"Paid from"*.
- **Invoice form:** label the field *"Customer pays into"*. It's the account printed on the PDF. Changing it later doesn't move payments already recorded.
- **Clearing the field** on edit (`null`) puts the record back on the default from Phase 1.
- **Changing only the mode** between cash and non-cash on edit also moves the record to the matching default, unless you send an account with it.
- **Filters:** `GET /payments-received?depositToAccountId=…` and `GET /expenses?paidThroughAccountId=…`. Use them for "show this account's money" links.
- **Errors:** an account outside the org is a 404, and Cash on an invoice is a 400.

### Invoice PDF (web copy)

`InvoicePdfDocument.tsx` must print the invoice's own account and fall back to the primary:

```ts
const bankAccount = invoice.bankAccount ?? organization.primaryBankAccount;
// render the bank block only when bankAccount?.accountNumber is set
```

The backend PDF already does this. Keep the two matching.

**Done when:** each form shows and saves its account, list rows show it, and the invoice PDF prints the invoice's own account.

---

## Phase 3: cash deposits and withdrawals (transfers)

A transfer moves money between two of the org's own accounts. It's neither income nor an expense. Requires `banking` permissions.

| What | Call |
|---|---|
| Create | `POST /account-transfers` `{ date, fromAccountId, toAccountId, amount, referenceNumber?, notes? }` |
| List | `GET /account-transfers?accountId=&dateFrom=&dateTo=&page=&limit=` (`accountId` matches either side) |
| One / edit / delete | `GET`, `PUT`, `DELETE /account-transfers/:id` (delete is soft) |

Responses include `fromAccount` and `toAccount` (Account).

### UI

- **On the Cash account: *"Deposit cash to bank"*** pre-fills from = Cash. The user picks the bank, amount, date and an optional deposit slip number.
- **On a bank account: *"Withdraw cash"*** pre-fills to = Cash.
- **A general *"Transfer between accounts"*** covers bank to bank.
- **Refused by the API:** the same account on both sides (400), and an amount of zero or less (400).

**Done when:** a user can record banking the day's takings in a few taps, and it shows on both accounts.

---

## Phase 4: account statements

Requires `read banking`. Dates are `YYYY-MM-DD`, both ends inclusive. Without dates the API returns this month up to today (Lagos time).

| What | Call |
|---|---|
| On screen | `GET /organizations/me/bank-accounts/:id/statement?from=&to=` |
| Download PDF | `GET /organizations/me/bank-accounts/:id/statement/pdf?from=&to=` |
| Email PDF | `POST /organizations/me/bank-accounts/:id/statement/email` `{ from?, to?, email? }` |

### Statement shape

```ts
type Statement = {
  account: Account;
  currencyCode: string;              // "NGN"
  period: { from: string; to: string };
  generatedAt: string;
  openingBalance: number;            // brought forward at `from`
  closingBalance: number;
  totals: {
    moneyIn: number;
    moneyOut: number;
    byKind: Record<Kind, { count: number; amount: number }>;
  };
  lines: Array<{
    kind: Kind;
    date: string;
    reference: string | null;        // PR-…, EXP-…, deposit slip
    title: string;                   // "Payment from Mrs Okafor", "Cash deposited"
    details: string | null;          // "Bank transfer · for INV-000123"
    moneyIn: number;
    moneyOut: number;
    balance: number;                 // running balance after this line
    sourceId: string | null;         // payment / expense / transfer id, for links
  }>;
};
type Kind = 'OPENING_BALANCE' | 'PAYMENT_RECEIVED' | 'BANK_CHARGE'
          | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
```

### UI

- **Entry point:** a *Statement* action on each account, Cash included.
- **Date range:** presets *This month* (the default), *Last month*, *This year*, and a custom range.
- **Top of the page:** four tiles (opening, money in, money out, closing), then a table with a running balance.
  - **First and last rows:** start with a *"Balance brought forward"* row and end with *"Closing balance"*.
  - **Colours:** money in green, money out red, negative balances red.
  - **Links:** each row opens its payment, expense or transfer via `kind` + `sourceId`.
- **Download:**
  - fetch as a blob and save it;
  - read the filename from the `Content-Disposition` header (now exposed through CORS), e.g. `statement-cash-2026-10-01-to-2026-10-31.pdf`.
- **Email:**
  - a small dialog with the recipient pre-filled with the user's own email and editable (e.g. their accountant);
  - on success, show *"Sent to {data.sentTo}"*;
  - a **502** means the email didn't go out, so offer *Try again*;
  - a **400** names the problem (e.g. no address).
- **Empty period:** the API still returns opening and closing balances with `lines: []`. Show *"No money in or out in this period."*

**Done when:** a user can view, download and email a statement for any account and period, and the figures match the PDF.

---

## Phase 5: bulk expenses and invoice costs

### Bulk

`POST /expenses/bulk` `{ expenses: CreateExpense[] }`, up to 100 entries.

- **All or nothing:** either every expense is saved or none are.
- **Errors name the row**, e.g. *"expenses[2]: Bank account … not found"*. Highlight that row.

### Costs of an invoice

The money spent to do the job on an invoice. **Additive:** each save adds expenses and never replaces earlier ones.

| What | Call |
|---|---|
| Record costs | `POST /invoices/:id/expenses` |
| See costs | `GET /invoices/:id/expenses` |

```json
{
  "date": "2026-10-29",
  "paymentMode": "CASH",
  "paidThroughAccountId": "…optional…",
  "vendorName": "Ladipo Spares",
  "notes": "optional",
  "lines": [{ "invoiceLineItemId": "…", "amount": 18000, "vendorName": "optional", "category": "optional" }],
  "other": [{ "name": "Towing", "amount": 5000, "category": "optional" }]
}
```

The `GET` response, also returned as `costs` after a `POST`, alongside `created`:

```ts
{
  invoiceNumber: string;
  invoiceTotal: number;
  lines: Array<{
    invoiceLineItemId: string;
    name: string;
    billed: number;   // the line before tax
    spent: number;
    margin: number;
    expenses: Expense[];
  }>;
  other: { spent: number; expenses: Expense[] }; // costs not tied to a line
  totals: { billed: number; spent: number; margin: number };
}
```

### Screen: *"Record costs"* on the invoice

- **Layout:** one row per invoice item showing *Billed*, *Spent so far* (from `GET`) and an empty *Spent now* box.
  - **Below the rows:** *+ Add other cost* for name + amount (towing, sublet, fuel…).
  - **Shared fields** at the top: date, payment mode, *Paid from* picker (Phase 1 rules), and supplier.
- **Saving:**
  - send only rows with an amount; blank or 0 rows are skipped by the API anyway;
  - after saving, refresh from the returned `costs`, so *Spent so far* goes up and the box clears.
- **Errors:**
  - entering the same line twice in one save is refused; the screen has one box per line, so this won't normally happen;
  - nothing entered → 400 *"Enter an amount for at least one item or other cost"*.
- **A *Costs & margin* panel** on the invoice page from `GET`: per line, billed / spent / margin, plus totals.
- **Lines rewritten after an edit:** when an invoice is edited and its items are rewritten, earlier costs stop pointing at a specific line. They show under *other* and still count.

### Expense form and list

- **Linking:** expenses can be linked to an invoice: `invoiceId`, optionally `invoiceLineItemId`.
- **Job card follows the invoice:** a linked expense takes the invoice's job card automatically. Disable the job-card field when an invoice is chosen. Sending a different job is a 400.
- **Responses:** expenses now include `invoice { id, invoiceNumber }` and `invoiceLineItem { id, name }`. Show *"for INV-000123 · Brake pads"*.
- **Filter:** `GET /expenses?invoiceId=…` returns an invoice's expenses.

**Done when:** a user can record a trip's costs against an invoice in one go, add more later, see margin per item, and the job card's P&L moves with the invoice.

---

## Back office

Platform admin only, under `back-office/organizations/:id/…`:

| What | Call |
|---|---|
| Accounts | `GET /back-office/organizations/:id/bank-accounts?includeCash=true` |
| Statement | `GET …/bank-accounts/:accountId/statement?from=&to=` |
| Download PDF | `GET …/bank-accounts/:accountId/statement/pdf?from=&to=` |
| Email PDF | `POST …/bank-accounts/:accountId/statement/email` `{ from?, to?, email? }` |

- **Placement:** on the organization page, add an *Accounts* tab with the list and a *Statement* action per account, reusing the Phase 4 screen.
- **Email recipient:** it goes to the business email (or the owner's) unless an address is typed, and the email reads *"sent by Rabbar support"*. Show `data.sentTo` after sending.
