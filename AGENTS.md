# AGENTS.md — Zona Atletismo webapp

Read this first. It is the entry point for coding agents (and humans) working on this repo.
More specific rules live in [src/worker/AGENTS.md](src/worker/AGENTS.md),
[src/react-app/AGENTS.md](src/react-app/AGENTS.md) and [drizzle/AGENTS.md](drizzle/AGENTS.md).
Full documentation is in [docs/](docs/README.md).

## What this is

A full-stack app for **Zona Atletismo**, a running-event organizer in Argentina
(Villa Constitución, Santa Fe). Organizers publish sporting events (races) with circuits, fees and
clothing. Athletes register themselves; *athletes managers* register the athletes they manage.
Payment is through MercadoPago Checkout Pro or a bank transfer the organizer records by hand. Once a
registration is paid, the system assigns a bib number, a timing chip and a reserved t-shirt size.
Organizers then deliver kits, export data for the timing software ("Rufus"), and track the
event's finances.

One Cloudflare Worker serves both the React SPA (static assets) and the Hono JSON API under
`/api/*`. Data lives in Cloudflare D1 (SQLite), accessed with Drizzle ORM.

## Repo map

```
src/worker/            Hono API (Cloudflare Worker entry: src/worker/index.ts)
  index.ts             Env interface, JWT middleware, router mounting, error handler
  <router>.ts          One Hono router per resource (auth, users, sportingEvents, ...)
  lib/                 Business logic + helpers (registrations, payments, chips, clothing, messages)
  db/schema.ts         Drizzle schema = source of truth for the DB
  schedule/            Placeholder for future cron/queue jobs (empty)
src/react-app/         React 19 SPA
  routes/              TanStack Router file-based routes (routeTree.gen.ts is GENERATED)
  components/          App components; components/ui = shadcn primitives
  lib/                 apiCalls, authCheck, genForm (useAppForm), queryCache, utils
src/shared/            Code shared by worker + app: zod schemas, roles, i18n labels, CUIT validation
drizzle/               SQL migrations (generated + hand-written "_z_" files), meta snapshots
migrate.sh             Applies one SQL file to local/remote D1 and logs it in migrated.<env>.txt
gen_test_data/         Python Faker script that generates fake users SQL
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server + local Worker + local D1 (http://localhost:5173) |
| `npm run build` | `tsc -b && vite build` (type-checks all three tsconfigs) |
| `npm run lint` | ESLint |
| `npm run check` | tsc + build + `wrangler deploy --dry-run` |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` after changing wrangler.json bindings |
| `npm run db:generate` | drizzle-kit: generate a migration from `src/worker/db/schema.ts` |
| `./migrate.sh local drizzle/<file>.sql` | Apply a migration to the local D1 |
| `npm run deploy` | Build + deploy to production (manual, from `main`) |

There is no test suite. Before you finish, verify with `npm run build` and `npm run lint`.

## Golden rules (non-obvious conventions)

1. **D1 bound-parameter limit (100 per query).** Every `inArray(...)` over user-supplied lists
   is chunked: 50 ids per query in most places, 25 where the query has more parameters.
   Multi-row inserts are chunked too: registrations go in 7 rows at a time, because each row has
   about 14 columns. Keep this pattern for any new bulk query.
2. **No real booleans in the DB.** Flags are `int` 0/1 (`hidden`, `banned`, `competitive`,
   `kit_delivered`, ...). Zod response schemas convert them with `z.coerce.boolean<number>()`.
   Write `x ? 1 : 0` when inserting.
3. **Dates are ISO strings in `text` columns.** Write them with `.toISOString()`. Read them
   through zod `z.coerce.date<string>()` in `src/shared/apiRespTypes.ts`.
4. **User primary key = DNI** (national ID) as a string of 7–28 characters. It can change (via
   `/api/users/changeId`); FKs use `onUpdate: cascade`.
5. **Location primary key = `"Locality, Province, Country"`**, the readable string itself.
   Sentinels:
   - `temporary_location`: the user typed an unknown locality, which is kept in `location_temp`.
   - Clothing size `N/A` (`SHIRT_NOT_INCLUDED`): no shirt.
   - `training_team_temp`: an unknown team name, waiting for organizer review.
6. **Response shape.** On success the API returns `{ data }` and/or `{ message }`; on error it
   returns `{ message }` with an HTTP status.
   `message` is always a bilingual object `{ es, en }` taken from `M` in
   [src/worker/lib/messages.ts](src/worker/lib/messages.ts). Never return a raw string. The
   frontend renders messages with `getMessage()`.
7. **Schemas live in `src/shared`.**
   - [types.ts](src/shared/types.ts) holds the domain zod schemas, with Spanish validation messages.
   - [apiRespTypes.ts](src/shared/apiRespTypes.ts) holds the `AR*` ("API Response") variants that
     coerce DB types.
   - The worker validates request bodies with them, and the frontend parses responses with them
     (`getAuthenticated(url, schema)`).
   - A common trick builds a Drizzle `select` from a schema's keys:
     `Schema.keyof().options.reduce((acc, f) => { acc[f] = table[f]; return acc }, {} as SelectedFields)`.
8. **Roles** (`src/shared/roles.ts`): `admin` > `organizer` > `athletes_manager` > `athlete`.
   - `authorizedOrg(role)` = organizer or admin.
   - `authorizedAthMan(role)` = manager, organizer or admin.
   - The frontend `authCheck` always lets `admin` through.
9. **UI text is Spanish** (Argentine voseo: "Completá", "Podés"). Code, comments and docs are
   English. API messages are bilingual.
10. **Generated files, don't edit:** `src/react-app/routeTree.gen.ts`, `worker-configuration.d.ts`,
    `drizzle/meta/*`, and generated `drizzle/NNNN_<words>.sql`.
11. **Secrets go in `.dev.vars`, not `.env`.** See [.dev.vars.example](.dev.vars.example).
12. Style: 2-space indentation, single quotes or double quotes (both exist; match the file),
    Hono routers written as one chained expression, two blank lines between top-level
    declarations in worker files.

## Recipes

**Add an API endpoint**
1. Put the logic in `src/worker/lib/<area>.ts`, returning `DataResult`/`NoDataResult`
   (`{status, message?, data?}`) when it can fail. Put thin handling in the router file.
2. Add the route to the existing router in `src/worker/<resource>.ts`. Start with the role guard
   (`if (!authorizedOrg(c.get('jwtPayload').role)) return c.json({message: M.UNAUTHORIZED}, 403)`),
   then `const db = drizzle(c.env.DB)`.
3. Add any new messages to `M` in `src/worker/lib/messages.ts` (both `es` and `en`).
4. Add request/response zod schemas to `src/shared/apiRespTypes.ts` if needed.
5. Is the endpoint public (no JWT)? Then update the bypass regexes in `src/worker/index.ts`.
6. Document it in [docs/08-api-reference.md](docs/08-api-reference.md).

**Add a page**
1. Create `src/react-app/routes/<path>.tsx`. The dev server regenerates `routeTree.gen.ts`.
2. Set `beforeLoad: authCheck([ROLE...])` or `unprotectedCheck()`, plus a `loader` that uses
   `getAuthenticatedThrow(url, schema)`.
3. If the page is a top-level destination, link it from `components/nav.tsx` (`LINKS_BY_ROLE`) or
   `routes/manage.tsx`.
4. Document it in [docs/11-features-and-views.md](docs/11-features-and-views.md).

**Change the DB schema**
1. Edit `src/worker/db/schema.ts`.
2. Run `npm run db:generate` and review the generated SQL.
3. Run `./migrate.sh local drizzle/<new>.sql`.
4. Update the zod schemas in `src/shared/types.ts`/`apiRespTypes.ts`.
5. Update [docs/06-data-model.md](docs/06-data-model.md).
6. Details: [drizzle/AGENTS.md](drizzle/AGENTS.md).

## Where to look

| Topic | Doc |
|---|---|
| Domain, roles, glossary | [docs/01-overview.md](docs/01-overview.md) |
| Architecture diagrams, request pipeline | [docs/02-architecture.md](docs/02-architecture.md) |
| Local setup, env vars | [docs/03-development.md](docs/03-development.md) |
| Deploy, secrets, webhooks | [docs/04-deployment.md](docs/04-deployment.md) |
| Tables and enums | [docs/06-data-model.md](docs/06-data-model.md) |
| Migrations and seeds | [docs/07-migrations-and-seeding.md](docs/07-migrations-and-seeding.md) |
| Every endpoint | [docs/08-api-reference.md](docs/08-api-reference.md) |
| Fees, bibs, chips, clothing, payments, teams | [docs/09-business-rules.md](docs/09-business-rules.md) |
| Frontend patterns and components | [docs/10-frontend.md](docs/10-frontend.md) |
| Every page and action | [docs/11-features-and-views.md](docs/11-features-and-views.md) |
| Known bugs and tech debt (check before "fixing" odd behavior) | [docs/12-known-issues.md](docs/12-known-issues.md) |

When you change behavior described in these docs, update the doc in the same change.
