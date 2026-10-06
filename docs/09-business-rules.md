# 09 — Business rules

This document describes the domain logic as implemented, mostly in
`src/worker/lib/sportingEventRegistrationActions.ts`, `sportingEventRegistrations.ts`, `chips.ts`
and `sportingEventClothing.ts`. When you change a rule, update this file.

## Event visibility and listing

- `hidden = 1` events are drafts. Only Org sees them in lists and on `GET /sportingEvents/:id`.
- The home page (`GET /sportingEvents`) shows events dated from **yesterday** onward, in four groups:
  - **open**: now is inside `[registration_start, registration_end]`;
  - **closed**: after `registration_end`;
  - **comingSoon**: before the window, or no window set;
  - **past**: the 5 most recent past events.

## Registration

`registerToSpEvent()`. The same endpoint covers an athlete registering themself, a manager
registering their athletes, and an organizer registering anyone.

| Check | Applies to |
|---|---|
| Caller is the user, or the manager of **all** target users | non-Org |
| Now ≥ `registration_start` and ≤ `registration_end` | non-Org |
| Circuit belongs to the event and is not `registration_disabled` | existence: all; disabled: non-Org |
| Caller not banned | all (checked in the router) |
| `fee_amount` (or the active promotional fee) is set | all |
| Every user has `clothing_shirt_size` and `date_of_birth` | all |

On success, for each user not already registered (already-registered users are skipped):

- `age_at_event_date` = age on the event date.
- `discount_percentage` is copied from the user; the reason is set automatically if it is non-zero.
- `promotional_fee_applied = 1` if a promotional fee exists and `promotional_fee_end` is in the future.
- `training_team_id` is a snapshot of the user's team.
- `demanded_clothing_id` = the event clothing row whose size equals the user's shirt size.
- `status = pending`. Rows are inserted 7 at a time (D1 parameter limit).
- If the fee after discount is 0, the registration is immediately `setRegistrationAsPaid`.

**Unregister**: deletes the row. Non-Org callers can only delete `pending` registrations.

## Fees and pending amount

`getPendingToPayAmount(event, registration)` is the canonical calculation:

```
fee        = fee_amount
if status == pending
   and promotional_fee_applied
   and now < promotional_fee_payment_due_date:
       fee = fee_amount_promotional            # promo only if paid in time
discount   = round(fee * discount_percentage / 100)
pending    = max(0, fee - discount - paid_amount)   # 0 unless status == pending
```

So a promotional registration that is not paid by `promotional_fee_payment_due_date` falls back to
the regular fee.

**Expired** (computed on read in `buildUserRegistration`): `status == pending` and
now > `fee_payment_due_date` and `pending > 0`. The UI then shows *Expirado* with nothing to pay.
Nothing is written to the DB. Organizers can *dismiss pending* or *reactivate*.

## Categories

`getCategory(ageRanges, age, sex, competitive, km)`:

- Non-competitive circuit → `"General"`.
- Competitive: the sorted `age_ranges` lower bounds, e.g. `18,30,40,50`, produce
  `<18/M/10KM`, `18-29/F/10KM`, …, `50+/M/10KM`.

## Marking a registration paid — `setRegistrationAsPaid`

This is the single entry point for the `paid` transition. It is used by the webhook, by manual
payments, discounts, dismiss, reactivate and zero-fee registrations. It is idempotent: an
already-paid registration is returned unchanged.

1. **Bib.** Take the highest bib among the event's paid registrations inside the circuit range
   `[bib_number_start, bib_number_end]`, and add 1. Start at `bib_number_start` if there is none.
   **Overflow:** if the range is exhausted, continue after the largest `bib_number_end` of any
   circuit in the event, so overflow bibs never collide with another circuit's range.
2. **Chip** (competitive circuits only). Take the highest `chip_id` among the event's paid
   registrations and call `getNextChipId`; see below. If no chip is available, the error is
   logged and `chip_id` stays null.
3. **Clothing.** If the registration demands a clothing row and
   (reserved count for that row) < `purchased_quantity`, reserve it
   (`reserved_clothing_id = demanded_clothing_id`). Otherwise leave it null; it can be filled
   later when stock is added.
4. Set `status=paid`, `full_payment_date=now`, `paid_amount += amount`.

### Chip ids — `getNextChipId(db, lastChip)`

Chip segments (`chips` table) are ordered by `(prefix, padding_n, start)`.

- No previous chip → the first id of the first segment.
- Otherwise, parse the prefix (letters), padding (digit count) and number. If the number is inside
  a segment and below its `end`, return number + 1 with the same padding.
- If the segment is exhausted, continue at the start of the next segment in order. When none is
  left, it throws "No more chips available".

The "highest chip" is found with a **string** `ORDER BY chip_id DESC`, which is why prefixes and
padding should stay consistent.

## Clothing

- **Demand** = all registrations (any status) pointing to a size. **Reserved** = paid
  registrations with `reserved_clothing_id`. **Lacking** = paid registrations with no reservation.
  **Potential lacking** = demand − purchased.
- Clothing is set up in the event form (type t-shirt or tank top, quantity per size). Once the
  event has clothing, more stock is added from the event's clothing page
  (`POST /:id/addClothing`) as **increments**. New stock is assigned right away to paid
  registrations of that size that lack one, oldest payment first.
- When a size row is created after registrations exist (event edit or add-clothing), registrations
  without a `demanded_clothing_id` whose user has that size are linked to it. Paid ones also get a
  reservation, up to the quantity.
- Organizers can reserve a different size for a paid registration (`assignAnotherClothingSize`).
  `N/A` means "no shirt" and is always allowed.

## Organizer actions on registrations

| Action | Effect |
|---|---|
| **Apply discount** | Sets `discount_percentage` (0–100) and `discount_reason` (default "Descuento manual aplicado por …"). Rows now owing 0 become paid (bib/chip assigned). The UI suggests a team discount for 10+ registrations from the same training team |
| **Dismiss pending** | Marks every selected non-paid registration paid without registering money |
| **Cancel** | `status=cancelled`, frees bib, chip and reserved clothing. The user cannot self-register again (the row still exists) until reactivated |
| **Reactivate** | Cancelled → pending (if still owing) or paid (new bib/chip) |
| **Transfer** | A paid registration's spot goes to another athlete who already has a pending registration in the event. The source becomes cancelled; the beneficiary becomes paid with the source's **bib and chip**, and their own demanded clothing is reserved |
| **Kit delivered** | Toggles `kit_delivered` |
| **Register payment** | Creates a `registration_payment` transaction (see Payments) |

## Payments

### Online (MercadoPago Checkout Pro)

- Only when `mercadopago_enabled = 1` for the event.
- The preference has one item per registration: `id = event_<eventId>_user_<userId>_reg_<regId>`
  (`buildItemId`), `unit_price` = current pending amount, and back URLs to the registration page
  (single) or the register-athletes page (bulk).
- The webhook parses each item id, calls `setRegistrationAsPaid(regId, userId, unit_price)`, and
  inserts two transactions:
  - inflow `registration_payment` = unit price, method `mercado_pago_checkout_pro`;
  - outflow `mercado_pago_fee` = unit price × (1 − net_received / total_paid).
- If a registration has a pending amount ≤ 0 but is not paid, `/pay` marks it paid and returns
  "already paid" (a self-healing path that the code says "MUST NEVER happen").

### Manual (bank transfer, cash)

- The athlete transfers to the event `bank_alias` and sends the receipt by WhatsApp.
- The organizer opens *Registrar pago* in the registrations admin, which creates a transaction
  `registration_payment / inflow / completed` with `registration_id`.
- **Create:** `newPaymentForRegistration` adds the amount to `paid_amount`. When the amount covers
  the pending total, it calls `setRegistrationAsPaid`.
- **Update/delete:** `calculatePaidBasedOnTransactions` recomputes `paid_amount` from all
  completed payment transactions of that registration. It marks the registration paid, or puts it
  back to `pending` if no longer covered (the assigned bib and chip are kept).

### Ledger

Every other income or expense (sponsorship, permits, prizes, clothing purchases, …) is a manual
transaction. `transaction_type` is derived from the category in the UI
(`TransactionTypeByCategory`). The balance page sums inflows − outflows.

## Event teams

Event teams pair registrations across circuits (e.g. a relay or a pair format).

- Both registrations must be in the same event, in **different** circuits, and both circuits must
  have `teams_enabled = 1`.
- The team is identified by `event_team_leader_id` = the requester's user id, set on both rows.
  Joining while already in a team dissolves the old team first. `destId: null` dissolves the team.
- The destination must not already be in another team.
- Athletes manage their own team from the registration page. Managers and organizers use the
  register-athletes and registrations admin pages.
- Lock: 15 days before the event, athletes (UI) and managers acting for others (API) can no
  longer change teams. Organizers can.

## Users, managers and profiles

- **Incomplete profile** (see [06-data-model.md](06-data-model.md#users)) → login sets
  `requireProfileUpdate`, and the SPA forces `/settings/profile` until the profile is saved.
- **Temporary location / team.** If a user cannot find their locality or team, they type it.
  - The locality is stored as `location = temporary_location` + `location_temp`; the team as
    `training_team_temp`.
  - Organizers review the entries at `/locations/checkTemporary` and
    `/trainingTeams/checkTemporary`, create the real entity, and assign it to the user
    (`/updateUser`).
- **Managers.** `users.manager_id` links athletes to an `athletes_manager`.
  - A manager can create athletes, who are auto-assigned to them, and edit, register and pay for
    them, but cannot change their role, discount or tax id.
  - Users choose their manager in their profile by searching the last digits of the manager's DNI.
  - Organizers can transfer athletes between managers or detach them. A manager's role cannot
    change while they still manage athletes.
- **Sensitive-field audit.** Phone and email changes made through `/settings` are logged in
  `user_updates` (old value → new value).
- **DNI change.** `POST /users/changeId` (Org). All references cascade.

## Bans

`POST /users/:id/ban` (Org, never on admins):

1. If the user is a manager, their athletes are detached (`manager_id = NULL`).
2. All their `pending` registrations become `cancelled`.
3. `banned = 1`, with `ban_reason`.

Banned users can log in and browse, but `/settings` and `/register` return 403. The SPA shows a red
banner and disables the register buttons. Paid registrations and history are kept. Unban restores
access (cancelled registrations are not reactivated automatically).

## Roles and access

See the matrix in [01-overview.md](01-overview.md#roles). The API is the authority; frontend
guards and hidden buttons only shape the UX. Admin accounts cannot be edited, re-roled or banned
through the API.
