# AGENTS.md — Worker / API (`src/worker`)

Read the root [AGENTS.md](../../AGENTS.md) first. The full endpoint list is in
[docs/08-api-reference.md](../../docs/08-api-reference.md), and the rules are in
[docs/09-business-rules.md](../../docs/09-business-rules.md).

## Entry point (`index.ts`)

- `Env` interface: the `DB` binding plus string secrets. When you add a secret, add it here,
  in `.dev.vars.example` and in [docs/03-development.md](../../docs/03-development.md).
- The Hono app is **created inside `fetch`** on every request.
- Middleware order:
  1. CORS on `*`.
  2. JWT on `/api/*`, with these exceptions:
     - `/api/webhook/*` always skips JWT. It is validated separately, by MercadoPago signature.
     - Any request **with** an `Authorization` header goes through the JWT check (a bad token gives 401).
     - Without a header, these are allowed anonymously:
       - `POST /api/auth/(sendCode|register|login)`
       - `GET /api/sportingEvents`, `/api/sportingEvents/all`, `/api/sportingEvents/<id>` (regex `RGX_SP_EVENTS`)
     - Everything else requires a JWT.
- The JWT payload (`JWTPayload` in `src/shared/types.ts`) contains `{id, phone, role, name, surname, manager_id}`.
  Read it with `c.get('jwtPayload')`. On anonymous routes it may be `undefined`, so use `?.`.
- `onError` maps 401 → `M.UNAUTHORIZED` and 403 → `M.FORBIDDEN`; everything else is logged and
  returns 500 `M.INTERNAL_SERVER_ERROR`.

## Router conventions

```ts
export const thingsRoute = new Hono<{ Bindings: Env, Variables: Variables }>()
  .use(async (c, next) => {            // optional router-wide guard
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    await next();
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    ...
    return c.json({ data });
  });
```

- Mutations are `POST` (also for update/delete: `/update/:id`, `/delete/:id`). No PUT/DELETE verbs.
- Validate bodies with `Schema.safeParse(await c.req.json())`. On failure, return 400 with a
  specific `M.*_INVALID_DATA` message.
- Use `res.meta.changes === 0` after an update to detect "not found / not allowed".
- Unique-constraint errors: wrap the update in try/catch and use `uniqueViolationColumn(err)`
  (`lib/utilsUsers.ts`), which returns the column name, e.g. `"email"`.
- Set `updated_at: new Date().toISOString()` (and `updated_by`) on updates by hand. There are no triggers.
- Mount new routers in `index.ts` with `app.route('/api/<name>', router)`.

## `lib/` — reuse these

| Function | File | Use |
|---|---|---|
| `DataResult`, `NoDataResult` | `lib/utils.ts` | Return type of lib functions: `{status, message?, data?}` |
| `M`, `appendToMessage` | `lib/messages.ts` | All bilingual messages. Keys ending in `_$APPEND` get a suffix appended |
| `userIsBanned(db, id)` | `lib/checks.ts` | Block actions for banned users |
| `registerToSpEvent` | `lib/sportingEventRegistrationActions.ts` | Create registrations (auth, window, circuit, fee, clothing demand, age) |
| `setRegistrationAsPaid(db, regId, by, amount?)` | same | **The single place** that marks paid and assigns bib, chip and reserved clothing. Idempotent if already paid |
| `newPaymentForRegistration` / `calculatePaidBasedOnTransactions` | same | Update `paid_amount` after a manual transaction is created, or edited/deleted |
| `applyDiscountToRegistrations`, `dismissPendingAmountsRegistrations`, `cancelRegistrations`, `reactivateRegistrations`, `transferRegistration`, `makeTeamSpEventRegistration`, `updateSpEventRegClothingReserved` | same | Organizer actions on registrations |
| `getPendingToPayAmount(event, reg)` | `lib/sportingEventRegistrations.ts` | **The** fee/discount/pending calculation. Pure function |
| `getAllUsersRegistrations`, `getUserRegistration`, `getPaidRegistrations` | same | Read models (flattened rows with category, user and clothing info) |
| `getNextChipId(db, lastChip)` | `lib/chips.ts` | Next chip id across the chip ranges |
| `getClothingStats`, `addClothingToSpEvent` | `lib/sportingEventClothing.ts` | Clothing stock |
| `addSpEvent`, `updateSpEvent`, `crudArray` | `lib/sportingEvents.ts` | Event + nested circuits/schedules/clothing diff-save |
| `buildItemId` / `parseItemId` | `lib/utilsPayment.ts` | MercadoPago item id `event_<e>_user_<u>_reg_<r>` |
| `registrationPaymentThroughMP` | `lib/sportingEventTransactions.ts` | Inserts the inflow + `mercado_pago_fee` outflow transactions |
| `sendCodeViaWhatsappTemplate` | `lib/whatsapp.ts` | WhatsApp OTP |

## Gotchas

- Use `drizzle(c.env.DB)` with no schema argument, so the relational `db.query.*` API is unavailable.
  Write explicit selects and joins.
- D1 has no interactive transactions here. Multi-step writes are sequential `await`s; keep them
  ordered so that a partial failure is harmless.
- Chunk `inArray` lists (50, or 25 when the query is wider). See the root AGENTS.md, rule 1.
- `expired` is **never stored**. It is computed when reading (pending + past due date + still owes).
- External calls use plain `fetch`: MercadoPago REST, the Graph API and the Cloudflare Images REST
  API. The `mercadopago` npm package is installed but unused.
- Check [docs/12-known-issues.md](../../docs/12-known-issues.md) before relying on webhook
  signature validation or OTP expiry; neither is enforced yet.
