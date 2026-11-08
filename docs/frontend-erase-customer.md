# Erase customer: backend contract

A business can erase one of its customers when that customer asks to be
forgotten. This is different from the normal **Delete**:

- **Delete**: for duplicates and mistakes. The customer's name and phone stay
  copied on job cards and inspections.
- **Erase**: for a customer who asked. Their details are removed everywhere
  they can be. Only the name and amounts on invoices and receipts are kept,
  because tax law requires them.

Both need the user to have the `delete` permission on customers. Put
**Erase customer…** next to Delete in the customer's menu, with a short
explanation of the difference.

## 1. Preview: `GET /api/v1/clients/:id/erase-impact`

```jsonc
{
  "customer": { "id": "…", "name": "Bayo Adewale" },
  "erase":     { "customer": 1, "vehicles": 2, "paperwork": 2, "reminders": 0, "files": 1 },
  "anonymise": { "jobCards": 3, "inspections": 0, "invoiceAddresses": 10 },
  "keep":      { "invoices": 10, "paymentsReceived": 9 },
  "warnings":  { "unlinkedSameName": { "invoices": 0, "jobCards": 0, "inspections": 0 } }
}
```

Show it as three lists, leaving out any line with a count of 0:

- **Deleted for good:** the customer, 2 vehicles, 2 documents (paperwork) and
  1 file.
- **Kept, without their details:** 3 job cards and 0 inspections. The work
  stays; their name becomes "Erased customer", and their phone, email and
  plate number are removed. Addresses are removed from 10 invoices.
- **Kept as they are (required by tax law):** the name and amounts on 10
  invoices and 9 payments.

If any count in `unlinkedSameName` is above 0, show a warning: "N invoices
carry this name but aren't linked to this customer, so they won't be
changed. Check them by hand if they belong to the same person."

Also add one line saying that notes and complaints typed on job cards are not
searched for the customer's details.

## 2. Erase: `POST /api/v1/clients/:id/erase`

```jsonc
{ "confirmName": "Bayo Adewale", "reason": "Asked by phone" }
```

- `confirmName` must match the customer's name exactly as `customer.name`
  shows it. Capital letters and extra spaces don't matter.
- `reason` is optional and is stored on the erasure record. Its field label
  must say **not to include the customer's name**, because the record must not
  identify them.

The response gives the counts of what actually happened, plus `erasureId` and
`erasedAt`:

```jsonc
{ "erasureId": "…", "erasedAt": "…",
  "erased": { "customer": 1, "vehicles": 2, "paperwork": 2, "reminders": 0 },
  "anonymised": { "jobCards": 3, "inspections": 0, "invoiceAddresses": 10 },
  "kept": { "invoices": 10, "paymentsReceived": 9 },
  "files": { "deleted": 1, "notFound": 0, "skipped": 0, "failed": 0 } }
```

After this the customer no longer exists, so navigate away from their page.
If `files.failed` is above 0, the customer is still erased; a few stored
files were left and support can remove them.

| Status | Meaning |
|---|---|
| 400 | `confirmName` doesn't match. The message gives the expected name |
| 404 | The customer is already gone |

This can't be undone. The confirm button should stay disabled until the
typed name matches.
