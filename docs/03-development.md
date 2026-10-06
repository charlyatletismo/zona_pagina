# 03 — Development

## Prerequisites

- **Node.js** 20 or newer (tested with 24) and npm.
- A **Cloudflare account**. You only need it for remote resources (deploying, the remote D1);
  local development runs fully offline with a local D1. Log in once with `npx wrangler login`.
- Optional: **Python ≥ 3.12** with `uv` or `pip`, to generate fake users
  ([07-migrations-and-seeding.md](07-migrations-and-seeding.md#fake-data-generator)).
- Optional: Meta WhatsApp Cloud API test credentials, if you want the real OTP login flow locally.

## 1. Install

```bash
git clone git@github.com:charlyatletismo/zona_pagina.git
cd zona_pagina
npm install
```

## 2. Environment variables: use `.dev.vars`, not `.env`

```bash
cp .dev.vars.example .dev.vars
```

**Why `.dev.vars`?** The Worker reads configuration from its `env` bindings (the `Env` interface in
[src/worker/index.ts](../src/worker/index.ts)), not from `process.env`. During `npm run dev`, the
Cloudflare Vite plugin, like `wrangler dev`, loads **`.dev.vars`** into those bindings.

A `.env` file is a different mechanism. Vite reads it for the *browser* bundle (`import.meta.env`),
and some tools fall back to it. Secrets must never end up there. Keep every Worker secret in
`.dev.vars`; it is gitignored (`.dev.vars*`, except `.dev.vars.example`). In production the same
names are set as Wrangler secrets (see [04-deployment.md](04-deployment.md)).

### Template

```ini
BASE_URL=http://localhost:5173
JWT_SECRET=change-me-to-a-long-random-string
GRAPH_API_TOKEN=
GRAPH_API_PHONE_NUMBER_ID=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_SECRET_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGES_API_TOKEN=
```

| Variable | Required for | Notes |
|---|---|---|
| `BASE_URL` | MercadoPago back URLs | Also declared in `wrangler.json` → `vars` for production. `.dev.vars` overrides it locally |
| `JWT_SECRET` | Everything that needs login | Any long random string locally (`openssl rand -hex 32`) |
| `GRAPH_API_TOKEN`, `GRAPH_API_PHONE_NUMBER_ID` | Sending the login OTP by WhatsApp | Meta app → WhatsApp → API setup. Needs an approved template named `verificar_otp` (language `es`, one body parameter and one URL-button parameter, both the code) |
| `MERCADOPAGO_ACCESS_TOKEN` | Online payments | Use **test** credentials locally. The name must be exactly `MERCADOPAGO_ACCESS_TOKEN` |
| `MERCADOPAGO_SECRET_KEY` | Webhook signature check | From the MercadoPago webhooks configuration |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_API_TOKEN` | Uploading/deleting event cover photos | Token with *Cloudflare Images: Edit* |

`DB` is not a variable. It is the D1 **binding** declared in `wrangler.json`.

Only `BASE_URL` and `JWT_SECRET` are needed to browse and click around locally. Features whose
variables are empty fail gracefully with an error message.

## 3. Create and seed the local database

The local D1 lives in `.wrangler/state/` and is created automatically on first use. Apply the SQL
files **in this order** with [migrate.sh](../migrate.sh), which records each applied file in
`migrated.local.txt` and skips files already listed there:

```bash
for f in \
  drizzle/0000_needy_quentin_quire.sql \
  drizzle/0000_z_indexes.sql \
  drizzle/0000_z_initial_test_data.sql \
  drizzle/0001_tiresome_harrier.sql \
  drizzle/0002_rapid_screwball.sql \
  drizzle/0003_black_clea.sql \
  drizzle/0004_fast_kid_colt.sql \
  drizzle/0005_giant_network.sql \
  drizzle/0006_glamorous_tinkerer.sql \
  drizzle/0007_zippy_whistler.sql \
  drizzle/0008_luxuriant_doctor_strange.sql \
  drizzle/0008_z_indexes.sql
do ./migrate.sh local "$f" || break; done
```

`0000_z_initial_test_data.sql` must run **before** `0003_*`; the reason is explained in
[07-migrations-and-seeding.md](07-migrations-and-seeding.md#apply-order). To start over, delete
`.wrangler/state` and `migrated.local.txt`.

Create a user for yourself. Pick any fake DNI and phone; the phone format is
`<country>_9_<10 digits>`:

```bash
npx wrangler d1 execute zona-atletismo-webapp-db --local --command \
  "INSERT INTO users (id, name, surname, phone, role) VALUES ('11111111', 'Dev', 'User', '54_9_3400000000', 'admin');"
```

To inspect data, use `npx wrangler d1 execute zona-atletismo-webapp-db --local --command "SELECT ..."`.

## 4. Run

```bash
npm run dev        # http://localhost:5173
```

A single process runs the SPA with HMR, the Worker API under `/api` and the local D1. The
TanStack Router plugin regenerates `src/react-app/routeTree.gen.ts` when route files change.

## 5. Logging in locally

Login sends a 6-digit code over WhatsApp. You have two options.

**A. Real OTP (WhatsApp test credentials).** Fill `GRAPH_API_*` with a Meta test app and add your
own phone as a test recipient. The code arrives by WhatsApp.

**B. Mint a dev token (no WhatsApp).** Generate a JWT signed with your local `JWT_SECRET`, for a
user that exists in the local DB with the **same role**. `/api/settings/updates` forces a logout
when the roles differ.

```bash
JWT_SECRET=$(grep ^JWT_SECRET .dev.vars | cut -d= -f2-) node --input-type=module -e "
import { sign } from 'hono/jwt';
console.log(await sign({ id: '11111111', phone: '54_9_3400000000', role: 'admin',
  name: 'Dev', surname: 'User', manager_id: null }, process.env.JWT_SECRET, 'HS256'));"
```

Then, in the browser devtools console on `http://localhost:5173`:

```js
localStorage.setItem('JWT_TOKEN', '<token>');
localStorage.setItem('USER_ROLE', 'admin');
localStorage.setItem('USER_ID', '11111111');
localStorage.setItem('USER_NAME', 'Dev');
localStorage.setItem('ADMIN_MODE', 'active');   // shows the role switcher in the nav
location.reload();
```

Complete the profile at `/settings/profile` if needed. While `REQUIRE_PROFILE_UPDATE` is `true`,
every page redirects there; it is only set by the real login.

> If WhatsApp sending fails, `POST /api/auth/sendCode` returns 500. The `temp_code` has already
> been saved at that point, but the login form only advances to the code step on a 200, so
> option B is the reliable offline path.

### Admin role switcher

When `ADMIN_MODE=active` (set automatically for admins at login), the nav shows a
`Rol: <role>` pill. Clicking it cycles the **UI** role (admin → organizer → athletes_manager →
athlete) to preview each role's menus. The API still enforces the real role in the JWT.

## 6. Payments and images locally

- **MercadoPago:** with test credentials, `/pay` returns a sandbox `init_point`. MercadoPago
  cannot reach `localhost`, so the webhook will not fire. To test the webhook, expose the dev
  server with a tunnel (e.g. `cloudflared tunnel --url http://localhost:5173`) and set that URL as
  the webhook in the MercadoPago test app. Alternatively, record the payment manually from
  `/sportingEvents/:id/allRegistrations` → *Registrar pago*.
- **Cloudflare Images:** uploads go to the real Images account in `CLOUDFLARE_ACCOUNT_ID`, even
  locally.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with the Cloudflare plugin (Worker + local D1) |
| `npm run build` | `tsc -b` over the app, worker and node tsconfigs, then `vite build` |
| `npm run preview` | Build, then serve the production build locally |
| `npm run lint` | ESLint (TS + react-hooks + react-refresh rules) |
| `npm run check` | `tsc`, build, then `wrangler deploy --dry-run` |
| `npm run cf-typegen` | `wrangler types`: regenerates `worker-configuration.d.ts` from `wrangler.json`. Run it after adding bindings |
| `npm run db:generate` | `drizzle-kit generate`: writes a new migration from `src/worker/db/schema.ts` |
| `npm run deploy` | Build + `wrangler deploy` (production) |

## Editor notes

- `.vscode/settings.json` marks `routeTree.gen.ts` read-only and hides it from search.
- Add shadcn components with `npx shadcn@latest add <component>`. `components.json` points to
  `src/react-app/components/ui`.
- There is no automated test suite. Verify changes with `npm run build`, `npm run lint` and
  manual testing in the browser.

## Git workflow

- Work on `dev` (or feature branches off it), then open a PR into `main`.
- `main` is what gets deployed (manually, see [04-deployment.md](04-deployment.md)).
