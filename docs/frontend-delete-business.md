# Delete business: backend contract

The business owner can delete their business and all its data from Settings.
It doesn't happen at once: the deletion is scheduled for 14 days later. Until
then the business works as normal, so the owner can export their data or
change their mind and cancel.

All routes are under `/api/v1/organizations/me/deletion` and need the user to
be signed in. Only the owner can request or cancel a deletion; the backend
checks this and returns a 403 for anyone else.

## 1. Show the section: `GET /organizations/me/deletion`

```jsonc
{
  "canRequest": true,          // false → hide the "Delete business" button
  "graceDays": 14,
  "scheduled": null            // or { "scheduledFor": "...", "requestedAt": "...", "requestedBy": "ba***@motors.ng" }
}
```

When `scheduled` is set, show a banner on every page, to everyone in the
business, not just on Settings. For example: "This business will be deleted
on 21 November 2026. Export your data before then." For the owner, add a
**Cancel deletion** button.

## 2. Ask for a code: `POST /organizations/me/deletion/request-code`

No body. The backend emails the owner a 6-digit code that lasts 10 minutes.

```jsonc
{
  "sentTo": "ba***@motors.ng",
  "expiresInMinutes": 10,
  "graceDays": 14,
  "willDelete": { "users": 2, "customers": 47, "vehicles": 11, "invoices": 149, "paymentsReceived": 156, "jobCards": 5, "inspections": 0, "expenses": 14 }
}
```

Use `willDelete` to show what will go, for example "47 customers, 149
invoices…". Next to it, put a link to the export dialog.

| Status | Meaning | What to show |
|---|---|---|
| 409 | A deletion is already scheduled | Refresh the section |
| 429 | A code was sent less than a minute ago | The `message`, which says how long to wait |
| 503 | The email could not be sent | "Couldn't send the code, try again" |

## 3. Confirm: `POST /organizations/me/deletion`

```jsonc
{ "otp": "123456", "confirmName": "Bayo Motors", "reason": "Closing the shop" }  // reason is optional, max 500 characters
```

Response: `{ "scheduledFor": "2026-11-21T07:43:00.000Z", "graceDays": 14 }`.
The owner also gets a confirmation email.

The `message` in each error is written to show to the user as it is:

| Status | Meaning |
|---|---|
| 400 | The business name doesn't match, or the code is wrong (the message says how many attempts are left) |
| 403 | Too many wrong codes. They need to request a new code |
| 410 | The code has expired |

## 4. Cancel: `DELETE /organizations/me/deletion`

Response: `{ "cancelled": true }`. Automatic renewal goes back to how it was
before.

| Status | Meaning |
|---|---|
| 404 | Nothing is scheduled |
| 409 | The deletion has already started and can't be cancelled |

## What the owner should be told

Put this text near the button:

> Deleting your business removes your team's accounts, customers, vehicles,
> invoices, payments, expenses, job cards and inspections. It happens 14 days
> after you confirm, and you can cancel until then. We keep a record of what
> you paid Rabbar, with no personal details, because tax law requires it.

Also show an **Export your data** link next to it.

During the 14 days, automatic renewal is paused, so their card is not
charged.
