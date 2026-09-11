# Rabbar Africa — Product Brief

Context for writing marketing copy / building a landing page. Everything below is
verified against the actual codebase. Anything NOT built is explicitly flagged so
it never ends up in a marketing promise.

---

## 1. What the product is

**Rabbar** is a multi-tenant SaaS for auto workshops and garages, built in and for
Nigeria. One workspace per workshop. Self-serve signup creates the organisation
plus an owner account. It combines Zoho-Books-style accounting with
workshop-floor operations (job cards, inspections, technicians).

Primary buyer: **the workshop owner**. Secondary daily user: **technicians and
service advisors** (average tech literacy — mobile-first matters).

Today it replaces: carbon-copy job card pads, a WhatsApp gallery of car photos,
and a cash notebook.

---

## 2. Modules that actually exist

All of these are wired to a live backend and appear in the app's sidebar.

### Dashboard
Revenue collected, total invoiced, outstanding receivables, overdue amount +
count, expenses, **net profit**, open job cards, job cards created, total and new
customers. Plus: invoice status breakdown, job card status breakdown, expenses by
category, **top debtors with days overdue**, a 12-month revenue/expenses/profit
trend series, and recent invoices/payments/job cards feeds. Date-range filtered.

### Customers & Vehicles
Individual or company clients. **Multiple vehicles per customer** — make, model,
year, registration number, VIN, colour. Per-client stats: lifetime invoiced,
paid, outstanding, with references to their invoices and payments.

### Job Cards — the workshop-floor spine
Customer + vehicle + complaint (in the customer's words) + diagnosis notes +
general notes. Odometer in and out. Promised date. Job number auto-generated from
a configurable series.

- **Priority:** LOW, NORMAL, HIGH, URGENT
- **Status:** OPEN → IN_PROGRESS → AWAITING_APPROVAL → AWAITING_PARTS →
  COMPLETED → DELIVERED → CANCELLED
- Assign **multiple technicians**, one flagged as **lead**
- Attach files/photos with category and notes
- Link inspections and invoices to the job
- **Per-job financials: invoiced, collected, outstanding, expenses total, profit**

### Inspections
Multi-point vehicle inspection, designed to be worked on a phone.

- Org-owned **checklist catalogue** grouped by category; items can be marked
  **required**, and required items block the inspection from being completed
- Checklist answers: OK / NEEDS_FIX / NOT_APPLICABLE, with notes
- Free-text **findings** with a status per component: good, needs attention,
  worn out, needs repair, needs replacement, faulty-repaired, faulty-replaced,
  damaged, missing, **not genuine** — plus an observation and up to 2 photos each
- **AI drafts the customer advisory** from the findings (and can summarise
  free-text notes). Stateless — the technician reviews and edits before it saves.
  This is a genuine differentiator; lead with it.
- Branded PDF, generated client-side, shareable via the Web Share API
  (WhatsApp, email, etc.)
- Per-vehicle inspection history
- Optional org setting: require signature on inspection

### Invoices
Line items with name, description, quantity, rate, discount and amount. Entity-
level or item-level discounts, taxes, adjustments. Notes and terms with org-wide
defaults. Branded PDF + WhatsApp/email share.

Statuses: draft, sent, paid, overdue, partial, cancelled.

**Two mechanics worth marketing, both unusual:**
- **Carried-forward invoices** — attach a customer's older unpaid invoice to a new
  one. The new invoice's total is never altered; the old balance stays a
  receivable on its own document. A payment is then **split oldest-debt-first**
  across the carried invoices before touching the current one.
- **Write-off / cancel write-off** for bad debt.

### Payments Received
Cash, bank transfer, card, cheque, **POS**. Statuses completed/pending/failed.
Receipt PDF + share. Can be collected directly against an invoice.

### Expenses
Categories: PARTS, SUBLET, CONSUMABLES, LABOR, TOWING, FEES, OTHER. Vendor name,
date, quantity, unit cost, payment mode, receipt file upload, notes.
**Can be attached to a job card** — this is what makes per-job profit real.

### Reminders
Types: SERVICE, FOLLOW_UP, PAPERWORK, INSURANCE (free-form, so custom types work).
Due by **date or by mileage**. Recurring intervals in months, days or mileage.
Server-computed "due in days" and overdue flag. Completing a reminder
auto-creates the next one at the interval. Can be dismissed or marked reminded.

### Paperwork
A vehicle/client **document expiry tracker** — road worthiness, insurance, full
paperwork bundles, or any custom document type. Issue date, expiry date, issuer,
reference number. **Multiple scans per document.** Renewal history is snapshotted
when a document is renewed. Status derived server-side: VALID, EXPIRING_SOON,
EXPIRED, NO_EXPIRY. There's a dedicated "expiring soon" view.
Very Nigeria-specific and underrated as a wedge.

### Technicians
Roster with first/last name, phone, email, **specialty**, active flag. Note:
technicians are *records*, not necessarily login users — a tech can be assigned to
job cards without having an account.

### Items / Services
Parts and labour catalogue. Auto-fills invoice line items (name, description,
rate) via a search combobox.

### Settings
- Company profile, **logo, brand primary + secondary colour, brand font**
- Multiple addresses (billing/shipping/office), with a primary
- Multiple bank accounts, with a primary
- Multi-currency
- Custom tax rates
- **Custom document numbering series per module** — prefix, suffix, separator,
  zero-padding, next number, auto-generate toggle. Covers invoice, payment,
  receipt, estimate, credit note, expense, inspection, customer, item, vehicle
  and more.
- General config: fiscal year start month, date format, time format, decimal
  places, number format, default payment terms, inclusive-tax default,
  discount-before-tax default, allowed payment methods, invoice footer, default
  invoice notes and terms, require-signature-on-inspection
- **Team management** and **roles** (see below)

---

## 3. NOT BUILT — do not put these on the landing page

- **Reports** — the nav item and route exist, but the page renders a header and
  nothing else. It is a stub. The Dashboard is the real analytics surface.
- **API access / API keys** — route constants exist, nothing implemented.
- **Multi-branch / multi-location** — not built. One org = one workshop.
- **Inventory / stock levels** — there is an items catalogue and an
  `allowNegativeStock` config flag, but no actual stock tracking. Do not claim
  inventory management.
- **Automated notifications / email templates** — route constants only.
- **Self-serve billing** — see section 5.
- **Purchase orders, sales orders, journal entries** — these appear only as
  options in the document-numbering settings, not as working modules.

---

## 4. User roles

Rabbar does **not** ship a fixed role list. It's a full custom RBAC matrix, and
this is a selling point in its own right.

**Permissions are `action:subject`.**
- Actions: create, read, update, delete
- Subjects: users, roles, permissions, organization, clients, vehicles,
  inspections, checklists, items, invoices, payments_received, technicians,
  job_cards, expenses, reminders

**Three structural tiers:**

1. **Platform admin** — Rabbar's own staff. Belongs to no organisation. Bypasses
   every permission check. Not a customer-facing role.
2. **`super_admin`** — the workshop owner. Created at signup. Bypasses every
   check *within their own organisation*. Cannot lock themselves out.
3. **Custom roles** — the owner creates these in Settings → Roles by ticking a
   subject × action grid. Some roles ship with the org as `isSystem` and can't be
   deleted. The codebase's own worked example is `workshop_manager`.

**Team joining flow:** invite by email with roles pre-assigned → invite is
PENDING → invitee sets their name and password → ACCEPTED. Invites can be resent
or cancelled. Users can be **deactivated** without deleting their history, or
have their roles reassigned at any time.

**Marketing translation:** don't sell "3 roles". Sell *"decide exactly what your
service advisor sees — your front desk can raise invoices without seeing your
profit margins."* That's the real value and it's genuinely implemented.

---

## 5. The "why" — day-to-day problems solved

Frame everything through the workshop owner's actual complaints:

| Their words | What solves it |
|---|---|
| "I don't know if this job made money." | Job card financials net invoices against parts/sublet/labour/towing expenses **per car**. Strongest owner-facing claim in the product. |
| "Customers owe me and I've lost track." | Top debtors ranked by days overdue on the dashboard; carried-forward invoices make an old debt physically follow the customer onto their next visit. |
| "The customer says I invented the fault." | Photo-backed inspection findings + AI-drafted advisory as a branded PDF, sent over WhatsApp *before* work starts. Turns arguments into approvals and makes upselling honest. |
| "Writing the advisory takes an hour." | AI drafts it from the findings; the technician edits. Minutes instead of an hour, and it reads professional. |
| "Which car is where, and what did I promise?" | Job card board: status, priority, promised date, odometer, assigned techs. |
| "Their insurance expired and they blame me." | Paperwork expiry tracking with scans and renewal history. |
| "I never get customers back." | Service reminders by date **or mileage** that regenerate on completion. Recurring revenue — easiest ROI story to tell. |
| "My invoices look like a market receipt." | Branded PDFs with your logo, colours, bank details and your own numbering series. |

**For a technician specifically:** no paperwork. Open the job card, work the
checklist on a phone, tap statuses, snap two photos per fault, let AI write the
advisory. Mobile-first is a real design constraint, not an afterthought.

---

## 6. Pricing — DECIDED

Three tiers, per workshop (not per car, not a cut of takings). Monthly with an
annual option at **2 months free**.

| | **Starter** | **Standard** | **Enterprise** |
|---|---|---|---|
| **Monthly** | Free | ₦5,000 | ₦15,000 |
| **Annual** | Free | ₦50,000 | ₦150,000 |
| **Users** | 1 | 5 | Unlimited |

**Starter (Free)** — get off the carbon-copy pad
- 1 user
- Up to 30 customers and their vehicles
- 15 job cards a month
- Invoices and payments
- Parts & services catalogue
- Basic dashboard
- PDFs carry a small Rabbar footer

**Standard (₦5,000/mo)** — the full workshop
- Everything in Starter, plus:
- Up to 5 users
- Unlimited job cards, customers and invoices
- Expense tracking and **per-job profit**
- Inspections with photo findings
- AI-drafted customer advisories
- Paperwork expiry tracking
- Service reminders by date or mileage
- Carry-forward invoices and write-offs
- Your logo and colours on every PDF
- Full dashboard: top debtors, profit trend
- WhatsApp support

**Enterprise (₦15,000/mo)** — bigger teams, tighter control
- Everything in Standard, plus:
- Unlimited users
- **Custom roles and permission matrix**
- Custom document numbering per module
- Multiple currencies and tax rates
- Multiple addresses and bank accounts
- Guided onboarding and data migration
- Priority WhatsApp support

### ⚠️ Important caveat on the free tier

**There is currently no self-serve billing.** A subscription gate blocks any
authenticated user without an ACTIVE subscription, showing a non-dismissible
dialog telling them to contact the admin. Activation is manual, over WhatsApp.

The backend has a Subscription model (status ACTIVE/CANCELLED/EXPIRED/INACTIVE,
a plan with tier + name, period dates, days-until-expiry, expiring-soon flag), so
it's *shaped* for tiers — but no tiers are defined and no payment flow exists.

**Consequence for the landing page:** a "Start free" CTA is writing a cheque the
app can't yet cash. Either (a) ship a free plan record that's auto-attached at
signup plus a gate exemption, or (b) make every CTA "Message us on WhatsApp" /
"Book a demo" until billing lands. The WhatsApp CTAs work today.

---

## 7. Brand & contact details

- **Name:** Rabbar Africa
- **Primary colour:** `#001F3E` (Maastricht blue) / `#013064` (cool black)
- **Secondary / accent:** `#DAE648` (maximum green yellow) — striking pair,
  worth building the visual identity around rather than replacing
- **Neutrals:** `#F4F4F4` down to `#1a1a2e`
- **Semantic:** success `#049020`, warning `#FFA500`, error `#D32F2F`
- **WhatsApp:** +234 916 000 2836
- **Email:** contact.rabbar@gmail.com

## 8. Vocabulary to use (and get right)

Job card · advisory · findings · checklist · sublet · consumables ·
roadworthiness · full paperwork · carried forward · write-off · odometer ·
lead technician · promised date · service advisor · POS · ₦ with tabular figures

Realistic sample data for mockups: plates like `KSF-241-LA`, job numbers like
`RB-JC-0418`, invoices like `RB-INV-0233`, vehicles like a Toyota Hilux 2.5D
2016 or a Sienna 2013, expenses like "Wheel balancing — Sublet — Tunde Tyres".
