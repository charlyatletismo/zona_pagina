# 08 — API reference

Base path: `/api`. All bodies are JSON unless noted.

- **Auth:** send `Authorization: Bearer <JWT>` (obtained from `POST /api/auth/login`). Anonymous
  access is only allowed where marked *public*. See
  [02-architecture.md](02-architecture.md#request-pipeline-api).
- **Response envelope:** `{ "data": ... }` and/or `{ "message": { "es": "...", "en": "..." } }`.
  Errors return `{ message }` with status 400, 401, 403, 404 or 500.
- **Role shorthands:**
  - **Any**: any logged-in user.
  - **Man+**: `athletes_manager`, `organizer` or `admin` (`authorizedAthMan`).
  - **Org**: `organizer` or `admin` (`authorizedOrg`).
- All mutations use `POST`.

Code: routers are in `src/worker/*.ts`, and their logic is in `src/worker/lib/*.ts`.

---

## Auth — `src/worker/auth.ts`

| Method & path | Access | Body | Result |
|---|---|---|---|
| `POST /auth/sendCode` | public | `{phone}` | Stores a 6-digit `temp_code` and sends it by WhatsApp. 404 if the phone is unknown (the UI then switches to register); 500 if WhatsApp fails |
| `POST /auth/register` | public | `{user_id, phone}` | Creates an `athlete` with only id + phone and sends the code. If a user with this phone or DNI already exists **and has a name**: 400 `USER_ALREADY_EXISTS`. If it exists without a name (an abandoned sign-up), the phone is updated |
| `POST /auth/login` | public | `{phone, code}` | 400 on a wrong code. On success it clears the code and returns `data: {token, id, name, role, requireProfileUpdate, language, banned, banReason, previewFeatures}` |
| `GET /authTest` | Any | — | Plain text "You are authorized" |

## Settings (own profile) — `src/worker/settings.ts`

| Method & path | Access | Body / params | Result |
|---|---|---|---|
| `GET /settings` | Any, not banned | — | Own profile (`ARSettingsSchema` fields) |
| `POST /settings` | Any, not banned | `SettingsSchema` without `id` | Updates the own profile. `tax_id` is ignored unless the caller is Org. Phone/email changes are logged in `user_updates`. 400 for a duplicate email/phone/tax_id |
| `GET /settings/managers/search/:partialId` | Any | ≥3 chars | Up to 10 `athletes_manager` users whose DNI **ends with** `partialId`: `{id, name, surname}` |
| `GET /settings/updates` | Any | — | `{banned, ban_reason}`. Returns 403 `{force_login: true}` if the DB role differs from the JWT role |

## Users — `src/worker/users.ts` (whole router: Man+)

A manager only sees and edits users whose `manager_id` is their own id.

| Method & path | Access | Body | Result |
|---|---|---|---|
| `GET /users` | Man+ | — | Org: all users `{id, name, surname, phone, email, training_team_id, manager_id, role, tax_id}`. Manager: their managed users (without manager_id, role or tax_id) |
| `POST /users/create` | Man+ | `ARUserSchema` (id and phone required) | Checks that the DNI, phone and email are unique. Only Org may set `role`, `discount_percentage` and `special_needs`; otherwise they are forced to athlete/0/null |
| `GET /users/managers` | Man+ | — | Org: all managers. Manager: their own manager, if any |
| `GET /users/:id/managedUsers` | Org | — | `{id, name, surname}` of users managed by `:id` |
| `POST /users/managementTransfer` | Org | `{usersIds[], newManagerId}` | Sets `manager_id` on those users |
| `POST /users/managementRemoval` | Org | `{usersIds[]}` | Clears `manager_id` |
| `GET /users/exists/:id` | Man+ | — | `{id, name, surname}`, or `data: undefined` |
| `GET /users/:id` | Man+ | — | Full user (`ARUserSchema`). Managers only get their own athletes, without role/tax_id/timestamps |
| `POST /users/:id/setRole` | Org | `{role}` | Cannot change admins. A manager who still has managed users cannot have their role changed |
| `POST /users/:id/update` | Man+ | Partial user | Ignores `id`, `created_at` and `temp_code`. Managers also cannot change `role`, `discount_percentage` or `tax_id`, and only for their own athletes. Admin rows cannot be edited. 400 for unique violations |
| `POST /users/changeId` | Org | `{oldId, newId}` | Renames the DNI. FKs cascade |
| `POST /users/:id/ban` | Org | `{reason}` | Cannot ban admins. If the user is a manager, their athletes are detached; the user's `pending` registrations become `cancelled`; sets `banned=1` |
| `POST /users/:id/unban` | Org | — | Clears the ban |

## Sporting events — `src/worker/sportingEvents.ts`

### Read

| Method & path | Access | Result |
|---|---|---|
| `GET /sportingEvents` | public | `{open, comingSoon, closed, past}` lists of `SportingEventBasicInfoSchema`. Non-hidden events dated from yesterday onward, classified by the registration window, plus the last 5 past events |
| `GET /sportingEvents/all` | public | All events (newest first, read in batches of 100). Hidden events are only included for Org |
| `GET /sportingEvents/myEvents` | Any | Events the caller is registered in |
| `GET /sportingEvents/myManagedUsersEvents` | Any (useful for Man+) | Events where any of the caller's managed users is registered |
| `GET /sportingEvents/:id` | public (hidden → Org only) | Full event with `circuits`, `schedules`, `clothing`, `athletes_registered`, `athletes_confirmed` and, when logged in, `user_registration_status {registration_status, circuit_id, pending_to_pay}` |
| `GET /sportingEvents/exists/:id` | Any (hidden → Org only) | `{id, title, date}` |
| `GET /sportingEvents/:id/paymentMethodsInfo` | Any | `{mercadopago_enabled, bank_alias}` |
| `GET /sportingEvents/:id/gallery` | Any | `{id, title, photo_id, gallery_photos: []}`. The gallery itself is not implemented |

### Create / edit (Org)

| Method & path | Body | Notes |
|---|---|---|
| `POST /sportingEvents/create` | `ARSportingEventSchema` without id, including nested `circuits[]`, `schedules[]`, `clothing[]` | Returns `data: newId` |
| `POST /sportingEvents/update/:id` | Same, with ids on existing nested items | Nested arrays are diffed (`crudArray`): items with an id are updated, items without one are inserted, and missing ones are deleted. New clothing sizes are linked to existing registrations |
| `POST /sportingEvents/delete/:id` | — | Cascades to circuits, schedules and clothing. Registrations and transactions keep the row with `event_id = NULL` |
| `POST /sportingEvents/:id/updatePhoto` | `multipart/form-data`, field `file` | Deletes the previous Cloudflare image, uploads the new one as `zonaatletismo_spevent_<id>.<ext>`, and stores `photo_id` |
| `POST /sportingEvents/:id/deletePhoto` | — | Deletes from Cloudflare Images and nulls `photo_id` |
| `GET /sportingEvents/:id/clothing` | — | Stock statistics per size: `{q_purchased, q_demanded, q_potential_lacking, q_reserved, q_lacking}` |
| `POST /sportingEvents/:id/addClothing` | `{data: [{size, purchased_quantity}]}` | Adds stock **increments**. Creates missing sizes (and `N/A`), then reserves the new stock for paid registrations without a reservation, oldest payment first. 400 if the event has no clothing yet |

### Registrations

| Method & path | Access | Body | Notes |
|---|---|---|---|
| `POST /sportingEvents/:id/register` | Any, not banned | `{circuitId, userIds[]}` | Non-Org callers may only register themselves or their managed users, inside the window, and not into a `registration_disabled` circuit. Users already registered are skipped silently. Each user needs a shirt size and a date of birth. Returns `data: [{id, user_id, status, circuit_id, pending_to_pay}]`. A zero fee marks the registration paid immediately |
| `POST /sportingEvents/:id/unregister` | Any | `{userIds[]}` | Deletes the rows. Non-Org callers can only delete `pending` registrations of themselves or their managed users |
| `GET /sportingEvents/:id/registration` | Any | — | The caller's registration (`ARSportingEventRegistrationSchema`): registration, demanded/reserved clothing, payment breakdown, category, event team members |
| `GET /sportingEvents/:id/allRegistrations` | Man+ | — | Flattened rows (`ARSportingEventRegistrationFlatSchema`) for every registration (Org) or for the caller's managed users (manager) |
| `GET /sportingEvents/:id/paidRegistrations?partialUserId=&bib=` | Org | — | Paid registrations matching a DNI suffix and/or a bib. Used by kit delivery and the kiosk |
| `POST /sportingEvents/:id/registrations/applyDiscount` | Org | `{registrationIds[], discount, reason}` | `discount` is clamped to 0–100. Registrations left owing nothing become paid |
| `POST /sportingEvents/:id/registrations/dismissPending` | Org | `{registrationIds[]}` | Marks every non-paid registration paid without money (`paid_amount` unchanged) |
| `POST /sportingEvents/:id/registrations/cancel` | Org | `{registrationIds[]}` | `status=cancelled`; frees the bib, chip and reserved clothing |
| `POST /sportingEvents/:id/registrations/reactivate` | Org | `{registrationIds[]}` | Cancelled or expired rows become `pending`, or `paid` (with a new bib/chip) if nothing is owed |
| `POST /sportingEvents/:id/registrations/transfer` | Org | `{fromRegistrationId, benefUserId}` | Source must be `paid`; the beneficiary must already have a non-paid, non-cancelled registration in the event. The source is cancelled; the beneficiary becomes paid and takes the source's bib and chip |
| `POST /sportingEvents/:id/registrations/makeTeam` | Any (self) / Man+ (others) | `{reqId, destId \| null}` | Pairs two registrations in different team-enabled circuits. `destId: null` dissolves the team. Non-Org callers acting for someone else are locked out 15 days before the event |
| `POST /sportingEvents/:id/registrations/:regId/deliveredKit/:flag` | Org | — | `flag` = `true`/`false` |
| `POST /sportingEvents/:id/registrations/assignAnotherClothingSize` | Org | `{registrationId, size}` | Reserves another size if stock allows (`N/A` always allowed). Returns `data.clothingId`; 400 when unavailable |

### Payments (MercadoPago)

| Method & path | Access | Body | Result |
|---|---|---|---|
| `POST /sportingEvents/:id/pay` | Any | — | Creates a Checkout Pro preference for the caller's pending amount. Returns `data: {init_point, preference_id}`. 400 if MP is disabled for the event or the registration is already paid |
| `POST /sportingEvents/:id/payMultipleRegs` | Man+ | `{registrationIds[]}` | One preference with one item per registration (managers: own athletes only) |

## Event transactions — `src/worker/sportingEventTransactions.ts` (whole router: Org)

| Method & path | Body | Notes |
|---|---|---|
| `GET /sportingEventTransactions/all/:eventId` | — | `ARSportEvTransactionMinSchema` rows, plus `vendor_or_athlete` (athlete "Surname Name (last 3 DNI digits)", or the vendor) |
| `GET /sportingEventTransactions/:id` | — | Full row |
| `POST /sportingEventTransactions/create` | `ARSportEvTransactionSchema` without id/timestamps/`external_payment_id` (webhook-only, dropped if sent) | If `registration_id` is set, `user_id` is taken from it. A completed `registration_payment` increases `paid_amount` and may mark the registration paid (`newPaymentForRegistration`) |
| `POST /sportingEventTransactions/update/:id` | same | A completed `registration_payment` recomputes `paid_amount` from all its completed transactions |
| `POST /sportingEventTransactions/delete/:id` | — | Recomputes `paid_amount` as above |

## Chips — `src/worker/chips.ts` (whole router: Org)

| Method & path | Body | Notes |
|---|---|---|
| `GET /chips` | — | All segments, ordered by prefix, padding, start |
| `POST /chips` | `{prefix, padding_n, start, end}` | Prefix is uppercased. 400 if `start > end` or the segment overlaps another with the same prefix and padding |
| `POST /chips/:id` | same | Update, with the same checks (excluding itself) |
| `POST /chips/:id/delete` | — | |

## Locations — `src/worker/locations.ts` (GET: Any; other methods: Org)

| Method & path | Notes |
|---|---|
| `GET /locations` | Array of location ids (strings), excluding `temporary_location` |
| `GET /locations/all` | Full rows |
| `GET /locations/temporary` | Org: `{id: userId, temp: location_temp}` for users with a temporary location |
| `GET /locations/:id` | One location |
| `POST /locations/create` | `{locality, province, country, latitude?, longitude?}`. The id is built as `"locality, province, country"` |
| `POST /locations/update/:id` | Same body. The id is recomputed and FKs cascade |
| `POST /locations/delete/:id` | References become NULL |
| `POST /locations/updateUser` | `{userId, location}`. Assigns an existing location and clears `location_temp` |

## Training teams — `src/worker/trainingTeams.ts`

| Method & path | Access | Notes |
|---|---|---|
| `GET /trainingTeams` | Any | `{id, name, location}` list (for selects) |
| `GET /trainingTeams/all` | Org | Full rows |
| `GET /trainingTeams/temporary` | Org | `{id: userId, temp: training_team_temp}` |
| `GET /trainingTeams/:id` | Org | |
| `POST /trainingTeams/create` | Org | `ARTrainingTeamSchema` without id. Returns `data.id` |
| `POST /trainingTeams/update/:id` | Org | |
| `POST /trainingTeams/delete/:id` | Org | Users' `training_team_id` becomes NULL |
| `POST /trainingTeams/updateUser` | Any (⚠ no role check) | `{userId, trainingTeamId}`. Assigns a team and clears `training_team_temp` |

## Webhooks — `src/worker/webhookMercadoPago.ts` (no JWT)

| Method & path | Notes |
|---|---|
| `POST /webhook/mercadoPago/payment?data.id=<paymentId>` | Requires the `x-signature` and `x-request-id` headers (403 if missing). The HMAC is computed but not enforced. Fetches the payment from MP; for each item, `parseItemId` → `setRegistrationAsPaid(amount = unit_price)` and records the transactions: inflow `registration_payment` = unit price, outflow `mercado_pago_fee` = unit price × (1 − net/total). Always returns 200 |
