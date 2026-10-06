# 12 — Known issues & tech debt

Found while reading the code to write these docs. None of them has been fixed yet. Each item says
where it is, so it can be turned into an issue. When you fix one, remove it from this list.

Severity: 🔴 security/money · 🟠 correctness · 🟡 UX/maintainability.

## Security

| | Issue | Where |
|---|---|---|
| 🔴 | **MercadoPago webhook signature not enforced.** The HMAC is computed and logged, but the `if (!valid) return 403` is commented out (FIXME: real payments failed validation). Anyone who knows a real MP payment id can trigger processing; the payment details are still fetched from MP. Possible causes to check: the manifest must use the `data.id` query param exactly as received (lower-cased if alphanumeric), and `ts`/`v1` parsing breaks if the values contain `=` | `src/worker/webhookMercadoPago.ts` |
| 🔴 | **JWTs never expire** (no `exp` claim) and live in `localStorage`. A leaked token is valid until `JWT_SECRET` is rotated. Role changes only take effect when the client calls `/settings/updates` | `src/worker/auth.ts`, `src/react-app/lib/utils.ts` |
| 🔴 | **OTP codes never expire and have no rate limit or attempt limit.** A 6-digit code stays valid until used. `M.AUTH_CODE_EXPIRED` exists but is unused | `src/worker/auth.ts` |
| 🔴 | **`POST /api/trainingTeams/updateUser` has no role check.** Any logged-in user can change any user's training team | `src/worker/trainingTeams.ts` |
| 🔴 | **Role escalation by organizers.** `setRole` doesn't validate the `role` value, and `/users/:id/update` lets Org send `role` (or `banned`) in the body, so an organizer could create another `admin`. This also bypasses the "manager with managed users" check in `setRole` | `src/worker/users.ts` |
| 🔴 | **Personal data committed.** `drizzle/0000_z_initial_prod_data.sql` contains real names, phones, emails and DNIs of staff | `drizzle/` |
| 🟡 | CORS allows every origin (`cors()` with defaults) | `src/worker/index.ts` |

## Payments & registrations

| | Issue | Where |
|---|---|---|
| 🟡 | **Webhook idempotency is best-effort.** Transactions are upserted by `external_payment_id` (`mp-<id>`), but the index is not unique. Two notifications for the same payment, processed at the same time, can both insert. Rows created before `0009` have no `external_payment_id`, so a late notification for an old payment inserts new rows | `src/worker/lib/sportingEventTransactions.ts` |
| 🟠 | **Webhook ignores the payment status.** Every notification with items marks the registrations paid, even for pending, rejected or refunded payments. The expected behavior is written as skipped tests (`MercadoPago webhook: payment status`) | `src/worker/webhookMercadoPago.ts`, `tests/webhookMercadoPago.test.ts` |
| 🟠 | **Bib race condition.** "max bib + 1" is not atomic; two payments processed at the same time can get the same bib. The unique index `(event_id, bib_number, chip_id)` only applies when `chip_id` is not null, so non-competitive circuits are unprotected | `src/worker/lib/sportingEventRegistrationActions.ts`, `drizzle/0000_z_indexes.sql` |
| 🟠 | The "latest chip" lookup uses a string `ORDER BY chip_id DESC`. It is only correct when every segment shares the prefix/padding ordering | same, `lib/chips.ts` |
| 🟠 | **Inconsistent pending amount on the event page.** `userRegisteredInEvent` uses `promotional_fee_end` (not the promo *payment* due date) and ignores discounts; `getPendingToPayAmount` is the correct one | `src/worker/lib/sportingEventRegistrations.ts` |
| 🟠 | **Transfer doesn't move money.** `transferRegistration` marks the beneficiary paid but leaves `paid_amount` on the cancelled source, and keeps whatever the beneficiary had paid | `lib/sportingEventRegistrationActions.ts` |
| 🟠 | `dismissPending` marks **every non-paid** selected row paid, including `cancelled` ones (the UI only offers it for pending/expired) | same |
| 🟠 | The 15-day lock on event teams is enforced in the API only for managers acting for others. An athlete changing their own team is blocked only by the UI | `src/worker/sportingEvents.ts` (`makeTeam`) |
| 🟠 | `/auth/register`: when the phone matches an *unnamed* user with a **different** DNI, the update runs `WHERE id = user_id` and silently does nothing | `src/worker/auth.ts` |
| 🟡 | Multi-step writes (bulk register then mark paid, event update with nested arrays) are not atomic, because D1 is used without `batch()`. A failure halfway leaves partial data | worker lib |
| 🟡 | `GET /sportingEvents/:id` loads every registration row just to count them | `lib/sportingEvents.ts` |

## Configuration & tooling

| | Issue | Where |
|---|---|---|
| 🟠 | The local `.dev.vars` historically used the key `MECADOPAGO_ACCESS_TOKEN` (typo). The code reads `MERCADOPAGO_ACCESS_TOKEN`, so local payments fail with a processing error. Use [.dev.vars.example](../.dev.vars.example) | `.dev.vars` |
| 🟡 | Preview-feature users are a hard-coded DNI list in `auth.ts`, and `PREVIEW_FEATURES` is not read by any view | `src/worker/auth.ts` |
| 🟡 | `gen_test_data/main.py` needs an untracked `last.txt`, and assigns training team ids 1–10, which must exist | `gen_test_data/` |
| 🟡 | The `mercadopago` npm dependency is unused. `package.json` still has the template's name/metadata (`vite-react-template`) | `package.json` |
| 🟡 | Several debug `console.log`s remain (webhook validation details, `active.tsx` loader, upload form, event form) | various |
| 🟡 | Planned background jobs (`user_updates` retention, notifications) are not implemented; see [05-tech-stack.md](05-tech-stack.md#planned) | `src/worker/index.ts`, `src/worker/schedule/` |

## Frontend

| | Issue | Where |
|---|---|---|
| 🟠 | **Editing a location without renaming it fails.** The duplicate-id refine includes the location being edited | `components/locationForm.tsx`, `routes/locations/$locationId.tsx` |
| 🟠 | `getNonOrgManagersData` overwrites the shared managers cache with partial search results. The users list can then show blank manager names for up to 5 minutes | `lib/queryCache.ts` |
| 🟡 | Login ignores the `?redirect=` set by `authCheck` and always lands on `/` | `components/loginForm.tsx` |
| 🟡 | The transfer dialog in allRegistrations is titled and described as "Descuento" (copy-paste) | `routes/sportingEvents/$eventId.allRegistrations.tsx` |
| 🟡 | The kit toggle label shows the *action* ("Kit NO entregado" when it is delivered), which reads like a state | same |
| 🟡 | Admins see only "Editar" on the event page and no actions in event tables (exact `organizer` checks), although every organizer route lets them in | `$eventId.index.tsx`, `sportingEventsMinTable.tsx` |
| 🟡 | The "Unir" bulk button is validated differently in registerAthletes and allRegistrations | both routes |
| 🟡 | `SpEvTransactionGeneralForm` lists `user_id`/`status` in `showFields` but doesn't render them; `description` is listed twice | `components/spEvTransactionGeneralForm.tsx` |
| 🟡 | Invalid HTML: a `<button>` inside a `<button>` (`ConfirmButton` `DialogTrigger` without `asChild`), and `<Link>` inside `<Button>` without `asChild`, in several tables. `/unauthorized` uses `Button asChild` with a text child | `components/confirmButton.tsx`, tables, `routes/unauthorized.tsx` |
| 🟡 | The training team edit page ignores team-load errors. The checkTemporary pages don't check the `updateUser` response | `routes/trainingTeams/*`, `routes/locations/checkTemporary.tsx` |
| 🟡 | Loaders run their API calls one after another (they could use `Promise.all`) | many routes |
| 🟡 | `ProfileForm` sorts the `locations` prop in place | `components/profileForm.tsx` |
| 🟡 | Some hard-coded grays and reds ignore dark mode (NotFound, team detail). Table sort tooltips are in English | various |
| 🟡 | The event gallery is a stub (`gallery_photos: []`, section commented out) | `lib/sportingEventPhotos.ts`, `editPhotoAndGallery` |
